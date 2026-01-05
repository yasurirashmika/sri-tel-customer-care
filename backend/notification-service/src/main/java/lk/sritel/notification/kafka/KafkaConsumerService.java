package lk.sritel.notification.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import lk.sritel.notification.dto.NotificationRequest;
import lk.sritel.notification.kafka.event.BillingEvent;
import lk.sritel.notification.kafka.event.PaymentEvent;
import lk.sritel.notification.kafka.event.ServiceActivationEvent;
import lk.sritel.notification.model.NotificationType;
import lk.sritel.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KafkaConsumerService {
    private static final Logger log = LoggerFactory.getLogger(KafkaConsumerService.class);
    
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @KafkaListener(topics = "billing-events", groupId = "notification-service-group")
    public void consumeBillingEvent(String message) {
        try {
            log.info("Received billing event: {}", message);
            
            BillingEvent event = objectMapper.readValue(message, BillingEvent.class);
            
            NotificationRequest request = new NotificationRequest();
            request.setUserId(event.getUserId());
            request.setPhoneNumber(event.getPhoneNumber());
            request.setEmail(event.getEmail());
            request.setType(NotificationType.BILL_GENERATED);
            request.setSubject("Your Sri Tel Bill is Ready");
            request.setMessage(String.format(
                "Dear customer, your bill of LKR %.2f has been generated. Due date: %s. Please pay to avoid disconnection.",
                event.getAmount(), event.getDueDate()
            ));
            request.setSendEmail(true);
            request.setSendSms(true);
            request.setSendPush(true);
            request.setMetadata(String.format("billId:%s", event.getBillId()));
            
            notificationService.sendNotification(request);
            
        } catch (Exception e) {
            log.error("Error processing billing event: {}", e.getMessage(), e);
        }
    }
    
    @KafkaListener(topics = "payment-events", groupId = "notification-service-group")
    public void consumePaymentEvent(String message) {
        try {
            log.info("Received payment event: {}", message);
            
            PaymentEvent event = objectMapper.readValue(message, PaymentEvent.class);
            
            NotificationType type = "SUCCESS".equals(event.getStatus()) 
                ? NotificationType.PAYMENT_SUCCESS 
                : NotificationType.PAYMENT_FAILED;
            
            String messageText = "SUCCESS".equals(event.getStatus())
                ? String.format("Your payment of LKR %.2f has been successfully processed. Transaction ID: %s",
                    event.getAmount(), event.getTransactionId())
                : String.format("Your payment of LKR %.2f has failed. Please try again or contact support.",
                    event.getAmount());
            
            NotificationRequest request = new NotificationRequest();
            request.setUserId(event.getUserId());
            request.setPhoneNumber(event.getPhoneNumber());
            request.setEmail(event.getEmail());
            request.setType(type);
            request.setSubject("Payment " + event.getStatus());
            request.setMessage(messageText);
            request.setSendEmail(true);
            request.setSendSms(true);
            request.setSendPush(true);
            request.setMetadata(String.format("transactionId:%s", event.getTransactionId()));
            
            notificationService.sendNotification(request);
            
        } catch (Exception e) {
            log.error("Error processing payment event: {}", e.getMessage(), e);
        }
    }
    
    @KafkaListener(topics = "service-activation-events", groupId = "notification-service-group")
    public void consumeServiceActivationEvent(String message) {
        try {
            log.info("Received service activation event: {}", message);
            
            ServiceActivationEvent event = objectMapper.readValue(message, ServiceActivationEvent.class);
            
            NotificationType type = "ACTIVATED".equals(event.getStatus())
                ? NotificationType.SERVICE_ACTIVATED
                : NotificationType.SERVICE_DEACTIVATED;
            
            String messageText = String.format(
                "Your %s service has been %s successfully.",
                event.getServiceName(),
                event.getStatus().toLowerCase()
            );
            
            NotificationRequest request = new NotificationRequest();
            request.setUserId(event.getUserId());
            request.setPhoneNumber(event.getPhoneNumber());
            request.setEmail(event.getEmail());
            request.setType(type);
            request.setSubject("Service " + event.getStatus());
            request.setMessage(messageText);
            request.setSendEmail(true);
            request.setSendSms(true);
            request.setSendPush(true);
            request.setMetadata(String.format("serviceId:%s", event.getServiceId()));
            
            notificationService.sendNotification(request);
            
        } catch (Exception e) {
            log.error("Error processing service activation event: {}", e.getMessage(), e);
        }
    }
}