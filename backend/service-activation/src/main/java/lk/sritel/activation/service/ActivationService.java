package lk.sritel.activation.service;

import lk.sritel.activation.dto.ServiceRequest;
import lk.sritel.activation.dto.ServiceResponse;
import lk.sritel.activation.model.ServiceStatus;
import lk.sritel.activation.model.TelcoService;
import lk.sritel.activation.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class ActivationService {
    
    private final ServiceRepository serviceRepository;
    private final ProvisioningSystemMock provisioningSystemMock;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    @Transactional
    public ServiceResponse activateService(ServiceRequest request) {
        log.info("Activating service for user: {}, type: {}", request.getUserId(), request.getServiceType());
        
        try {
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
            log.info("Service saved to database: {}", service.getId());
            
            // Try to publish event to Kafka (non-blocking, won't fail the activation if Kafka is down)
            try {
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
                log.info("Event published to Kafka successfully");
            } catch (Exception kafkaEx) {
                log.warn("Failed to publish event to Kafka, but service activation successful", kafkaEx);
                // Don't throw exception - service is already activated
            }
            
            return mapToResponse(service);
            
        } catch (Exception e) {
            log.error("Error activating service", e);
            throw new RuntimeException("Failed to activate service: " + e.getMessage());
        }
    }
    
    @Transactional
    public ServiceResponse deactivateService(Long serviceId) {
        log.info("Deactivating service: {}", serviceId);
        
        try {
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
            log.info("Service deactivated successfully: {}", serviceId);
            
            // Try to publish event to Kafka (non-blocking)
            try {
                Map<String, Object> event = new HashMap<>();
                event.put("eventType", "SERVICE_DEACTIVATED");
                event.put("serviceId", service.getId());
                event.put("userId", service.getUserId());
                event.put("serviceType", service.getServiceType().toString());
                event.put("timestamp", System.currentTimeMillis());
                
                kafkaTemplate.send("service-events", event);
                log.info("Deactivation event published to Kafka");
            } catch (Exception kafkaEx) {
                log.warn("Failed to publish deactivation event to Kafka", kafkaEx);
                // Don't throw exception
            }
            
            return mapToResponse(service);
            
        } catch (Exception e) {
            log.error("Error deactivating service", e);
            throw new RuntimeException("Failed to deactivate service: " + e.getMessage());
        }
    }
    
    public List<ServiceResponse> getUserServices(Long userId) {
        log.info("Fetching services for user: {}", userId);
        return serviceRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<ServiceResponse> getActiveServices(Long userId) {
        log.info("Fetching active services for user: {}", userId);
        return serviceRepository.findByUserIdAndStatus(userId, ServiceStatus.ACTIVE)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public ServiceResponse getServiceById(Long serviceId) {
        log.info("Fetching service by ID: {}", serviceId);
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