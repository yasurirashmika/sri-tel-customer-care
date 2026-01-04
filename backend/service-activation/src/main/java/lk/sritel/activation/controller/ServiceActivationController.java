package lk.sritel.activation.controller;

import lk.sritel.activation.dto.ServiceRequest;
import lk.sritel.activation.dto.ServiceResponse;
import lk.sritel.activation.service.ActivationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ServiceActivationController {
    
    private final ActivationService activationService;
    
    @PostMapping("/activate")
    public ResponseEntity<ServiceResponse> activateService(@RequestBody ServiceRequest request) {
        return ResponseEntity.ok(activationService.activateService(request));
    }
    
    @PostMapping("/deactivate/{serviceId}")
    public ResponseEntity<ServiceResponse> deactivateService(@PathVariable Long serviceId) {
        return ResponseEntity.ok(activationService.deactivateService(serviceId));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ServiceResponse>> getUserServices(@PathVariable Long userId) {
        return ResponseEntity.ok(activationService.getUserServices(userId));
    }
    
    @GetMapping("/user/{userId}/active")
    public ResponseEntity<List<ServiceResponse>> getActiveServices(@PathVariable Long userId) {
        return ResponseEntity.ok(activationService.getActiveServices(userId));
    }
    
    @GetMapping("/{serviceId}")
    public ResponseEntity<ServiceResponse> getServiceById(@PathVariable Long serviceId) {
        return ResponseEntity.ok(activationService.getServiceById(serviceId));
    }
}