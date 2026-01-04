package lk.sritel.payment.service;

import lk.sritel.payment.dto.PaymentRequest;
import lk.sritel.payment.dto.PaymentResponse;
import lk.sritel.payment.model.Payment;
import lk.sritel.payment.model.PaymentStatus;
import lk.sritel.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final PaymentGatewayMock paymentGatewayMock;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        // Create payment record
        Payment payment = Payment.builder()
                .userId(request.getUserId())
                .billId(request.getBillId())
                .transactionId(UUID.randomUUID().toString())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .status(PaymentStatus.PROCESSING)
                .cardLastFour(request.getCardNumber().substring(request.getCardNumber().length() - 4))
                .build();
        
        payment = paymentRepository.save(payment);
        
        try {
            // Process payment through gateway
            Map<String, Object> gatewayResponse = paymentGatewayMock.processPayment(
                    payment.getTransactionId(),
                    request.getCardNumber(),
                    request.getCardExpiry(),
                    request.getCvv(),
                    request.getAmount()
            );
            
            boolean success = (boolean) gatewayResponse.get("success");
            payment.setGatewayResponse(gatewayResponse.toString());
            
            if (success) {
                payment.setStatus(PaymentStatus.COMPLETED);
                
                // Publish payment completed event
                Map<String, Object> event = new HashMap<>();
                event.put("eventType", "PAYMENT_COMPLETED");
                event.put("paymentId", payment.getId());
                event.put("userId", payment.getUserId());
                event.put("billId", payment.getBillId());
                event.put("transactionId", payment.getTransactionId());
                event.put("amount", payment.getAmount());
                event.put("timestamp", System.currentTimeMillis());
                
                kafkaTemplate.send("payment-events", event);
                kafkaTemplate.send("notification-events", event);
            } else {
                payment.setStatus(PaymentStatus.FAILED);
            }
            
        } catch (Exception e) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setGatewayResponse("Error: " + e.getMessage());
        }
        
        payment = paymentRepository.save(payment);
        return mapToResponse(payment);
    }
    
    public List<PaymentResponse> getUserPayments(Long userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public PaymentResponse getPaymentById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return mapToResponse(payment);
    }
    
    public PaymentResponse getPaymentByTransaction(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return mapToResponse(payment);
    }
    
    public List<PaymentResponse> getPaymentsByBill(Long billId) {
        return paymentRepository.findByBillId(billId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .userId(payment.getUserId())
                .billId(payment.getBillId())
                .transactionId(payment.getTransactionId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod().toString())
                .status(payment.getStatus().toString())
                .cardLastFour(payment.getCardLastFour())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}