package lk.sritel.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    @Value("${sms.provider.api-url:https://api.sms-provider.com/send}")
    private String smsApiUrl;
    
    @Value("${sms.provider.api-key:your-api-key}")
    private String apiKey;
    
    @Value("${sms.provider.sender-id:SRITEL}")
    private String senderId;
    
    @Value("${notification.sms.enabled:true}")
    private Boolean smsEnabled;
    
    public void sendSms(String phoneNumber, String message) {
        if (!Boolean.TRUE.equals(smsEnabled)) {
            log.info("SMS sending is disabled");
            return;
        }
        
        try {
            // Mock SMS sending - Replace with actual SMS provider API
            log.info("Sending SMS to {}: {}", phoneNumber, message);
            
            // Example implementation for actual SMS provider
            /*
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("to", phoneNumber);
            requestBody.put("from", senderId);
            requestBody.put("message", message);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(
                smsApiUrl,
                request,
                String.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                log.info("SMS sent successfully to: {}", phoneNumber);
            } else {
                throw new RuntimeException("SMS API returned error: " + response.getStatusCode());
            }
            */
            
            // Mock success
            log.info("SMS sent successfully to: {} (MOCK)", phoneNumber);
            
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", phoneNumber, e.getMessage());
            throw new RuntimeException("Failed to send SMS", e);
        }
    }
    
    public void sendBillReminder(String phoneNumber, String customerName, Double amount, String dueDate) {
        String message = String.format(
            "Dear %s, your Sri Tel bill of LKR %.2f is due on %s. Pay now to avoid disconnection. - SRITEL",
            customerName, amount, dueDate
        );
        sendSms(phoneNumber, message);
    }
    
    public void sendPaymentConfirmation(String phoneNumber, String customerName, Double amount, String transactionId) {
        String message = String.format(
            "Dear %s, your payment of LKR %.2f has been received. Transaction ID: %s. Thank you! - SRITEL",
            customerName, amount, transactionId
        );
        sendSms(phoneNumber, message);
    }
    
    public void sendServiceActivation(String phoneNumber, String serviceName) {
        String message = String.format(
            "Your %s service has been activated successfully. Enjoy your service! - SRITEL",
            serviceName
        );
        sendSms(phoneNumber, message);
    }
}