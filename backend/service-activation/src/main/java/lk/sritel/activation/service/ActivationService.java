package lk.sritel.activation.service;

import lk.sritel.activation.dto.ServiceRequest;
import lk.sritel.activation.dto.ServiceResponse;
import lk.sritel.activation.model.ServiceStatus;
import lk.sritel.activation.model.TelcoService;
import lk.sritel.activation.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivationService {
    
    private final ServiceRepository serviceRepository;
    private final ProvisioningSystemMock provisioningSystemMock;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    @Transactional
    public ServiceResponse activateService(ServiceRequest request) {
        // Call provisioning system
        Map<String, Object> provisioningResponse = provisioningSystemMock.activateService(
                request.getMobileNumber(),
                request.getServiceType().toString(),
                request.getServiceCode()
        );
        
        boolean success = (boolean) provisioningResponse.get("success");
        
        if (!success) {
            throw new RuntimeException("Service activation failed: " + provisioningResponse.get("message"));
        }
        
        // Create service record
        TelcoService service = TelcoService.builder()
                .userId(request.getUserId())
                .mobileNumber(request.getMobileNumber())
                .serviceType(request.getServiceType())
                .serviceName(request.getServiceName())
                .serviceCode(request.getServiceCode())
                .status(ServiceStatus.ACTIVE)
                .activatedAt(LocalDateTime.now())
                .build();
        
        service = serviceRepository.save(service);
        
        // Publish service activated event
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", "SERVICE_ACTIVATED");
        event.put("serviceId", service.getId());
        event.put("userId", service.getUserId());
        event.put("mobileNumber", service.getMobileNumber());
        event.put("serviceType", service.getServiceType().toString());
        event.put("serviceName", service.getServiceName());
        event.put("timestamp", System.currentTimeMillis());
        
        kafkaTemplate.send("service-events", event);
        kafkaTemplate.send("notification-events", event);
        
        return mapToResponse(service);
    }
    
    @Transactional
    public ServiceResponse deactivateService(Long serviceId) {
        TelcoService service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        
        // Call provisioning system
        Map<String, Object> provisioningResponse = provisioningSystemMock.deactivateService(
                service.getMobileNumber(),
                service.getServiceType().toString(),
                service.getServiceCode()
        );
        
        boolean success = (boolean) provisioningResponse.get("success");
        
        if (!success) {
            throw new RuntimeException("Service deactivation failed");
        }
        
        service.setStatus(ServiceStatus.INACTIVE);
        service.setDeactivatedAt(LocalDateTime.now());
        service = serviceRepository.save(service);
        
        // Publish service deactivated event
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", "SERVICE_DEACTIVATED");
        event.put("serviceId", service.getId());
        event.put("userId", service.getUserId());
        event.put("serviceType", service.getServiceType().toString());
        event.put("timestamp", System.currentTimeMillis());
        
        kafkaTemplate.send("service-events", event);
        
        return mapToResponse(service);
    }
    
    public List<ServiceResponse> getUserServices(Long userId) {
        return serviceRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<ServiceResponse> getActiveServices(Long userId) {
        return serviceRepository.findByUserIdAndStatus(userId, ServiceStatus.ACTIVE)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public ServiceResponse getServiceById(Long serviceId) {
        TelcoService service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        return mapToResponse(service);
    }
    
    private ServiceResponse mapToResponse(TelcoService service) {
        return ServiceResponse.builder()
                .id(service.getId())
                .userId(service.getUserId())
                .mobileNumber(service.getMobileNumber())
                .serviceType(service.getServiceType().toString())
                .serviceName(service.getServiceName())
                .serviceCode(service.getServiceCode())
                .status(service.getStatus().toString())
                .activatedAt(service.getActivatedAt())
                .deactivatedAt(service.getDeactivatedAt())
                .build();
    }
}