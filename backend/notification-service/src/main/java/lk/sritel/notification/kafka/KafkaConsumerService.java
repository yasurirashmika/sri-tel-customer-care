package lk.sritel.notification.kafka;

import lk.sritel.notification.dto.NotificationRequest;
import lk.sritel.notification.kafka.event.BillingEvent;
import lk.sritel.notification.model.NotificationType;
import lk.sritel.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaConsumerService {

    private final NotificationService notificationService;

    /**
     * Updated to handle the Map format sent by BillingService
     */
    @KafkaListener(topics = "billing-events", groupId = "notification-service-group")
    public void consumeBillingEvent(Map<String, Object> event) {
        log.info("Received billing event via Kafka: {}", event);
        
        try {
            NotificationRequest request = new NotificationRequest();
            
            // Extracting from the Map (Matching BillingService.java keys)
            request.setUserId(String.valueOf(event.get("userId")));
            request.setPhoneNumber((String) event.get("phoneNumber"));
            request.setEmail((String) event.get("email"));
            
            // Map the eventType string to our Enum
            String eventType = (String) event.get("eventType");
            if ("BILL_GENERATED".equals(eventType)) {
                request.setType(NotificationType.BILL_GENERATED);
                request.setSubject("Sri Tel - Bill Generated");
            } else {
                request.setType(NotificationType.BILL_GENERATED); // Default
                request.setSubject("Sri Tel Notification");
            }

            Double amount = (Double) event.get("amount");
            String period = (String) event.get("billingPeriod");
            
            request.setMessage(String.format(
                "Dear Customer, your bill for %s has been generated. Amount: LKR %.2f.",
                period, amount
            ));
            
            request.setSendEmail(true);
            request.setSendSms(true);
            request.setSendPush(true);
            request.setMetadata("billId:" + event.get("billId"));

            // This triggers the DB Save AND the Dashboard update
            notificationService.sendNotification(request);
            
        } catch (Exception e) {
            log.error("Error processing Kafka message: {}", e.getMessage());
        }
    }
}