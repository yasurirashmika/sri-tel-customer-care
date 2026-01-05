package lk.sritel.notification.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEvent {
    private String transactionId;
    private String userId;
    private String phoneNumber;
    private String email;
    private Double amount;
    private String paymentMethod;
    private String status; // SUCCESS, FAILED
    private String timestamp;
}