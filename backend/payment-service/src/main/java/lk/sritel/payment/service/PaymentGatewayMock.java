package lk.sritel.payment.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class PaymentGatewayMock {
    
    private final Random random = new Random();
    
    public Map<String, Object> processPayment(
            String transactionId,
            String cardNumber,
            String expiry,
            String cvv,
            BigDecimal amount) {
        
        Map<String, Object> response = new HashMap<>();
        
        // Simulate processing delay
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Mock validation - 95% success rate
        boolean success = random.nextInt(100) < 95;
        
        response.put("success", success);
        response.put("transactionId", transactionId);
        response.put("amount", amount);
        response.put("message", success ? "Payment processed successfully" : "Payment declined");
        response.put("gatewayTransactionId", "GW-" + System.currentTimeMillis());
        
        return response;
    }
}