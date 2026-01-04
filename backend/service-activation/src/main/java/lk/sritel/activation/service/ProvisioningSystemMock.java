package lk.sritel.activation.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ProvisioningSystemMock {
    
    public Map<String, Object> activateService(String mobileNumber, String serviceType, String serviceCode) {
        Map<String, Object> response = new HashMap<>();
        
        // Simulate network delay
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Mock success
        response.put("success", true);
        response.put("message", "Service activated in network");
        response.put("provisioningId", "PROV-" + System.currentTimeMillis());
        
        return response;
    }
    
    public Map<String, Object> deactivateService(String mobileNumber, String serviceType, String serviceCode) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        response.put("success", true);
        response.put("message", "Service deactivated in network");
        
        return response;
    }
}