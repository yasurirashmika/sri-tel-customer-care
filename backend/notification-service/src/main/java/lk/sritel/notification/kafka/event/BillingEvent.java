package lk.sritel.notification.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillingEvent {
    private String billId;
    private String userId;
    private String phoneNumber;
    private String email;
    private Double amount;
    private String dueDate;
    private String billingPeriod;
    private String eventType; // BILL_GENERATED, BILL_DUE_REMINDER, etc.
}