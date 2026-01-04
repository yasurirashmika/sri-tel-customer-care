package lk.sritel.user.service;

import lk.sritel.user.dto.UserEventDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    private static final Logger logger = LoggerFactory.getLogger(KafkaProducerService.class);

    private final KafkaTemplate<String, UserEventDTO> kafkaTemplate;

    @Value("${kafka.topics.user-events}")
    private String userEventsTopic;

    @Value("${kafka.topics.user-registration}")
    private String userRegistrationTopic;

    @Value("${kafka.topics.user-login}")
    private String userLoginTopic;

    public KafkaProducerService(KafkaTemplate<String, UserEventDTO> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendUserEvent(UserEventDTO event) {
        try {
            Message<UserEventDTO> message = MessageBuilder
                    .withPayload(event)
                    .setHeader(KafkaHeaders.TOPIC, userEventsTopic)
                    .build();

            kafkaTemplate.send(message);
            logger.info("✅ User event sent to Kafka topic '{}': {}", userEventsTopic, event.getEventType());
        } catch (Exception e) {
            logger.error("❌ Failed to send user event to Kafka: {}", e.getMessage());
        }
    }

    public void sendRegistrationEvent(UserEventDTO event) {
        try {
            Message<UserEventDTO> message = MessageBuilder
                    .withPayload(event)
                    .setHeader(KafkaHeaders.TOPIC, userRegistrationTopic)
                    .build();

            kafkaTemplate.send(message);
            logger.info("✅ Registration event sent to Kafka topic '{}' for user: {}", 
                       userRegistrationTopic, event.getMobileNumber());
        } catch (Exception e) {
            logger.error("❌ Failed to send registration event to Kafka: {}", e.getMessage());
        }
    }

    public void sendLoginEvent(UserEventDTO event) {
        try {
            Message<UserEventDTO> message = MessageBuilder
                    .withPayload(event)
                    .setHeader(KafkaHeaders.TOPIC, userLoginTopic)
                    .build();

            kafkaTemplate.send(message);
            logger.info("✅ Login event sent to Kafka topic '{}' for user: {}", 
                       userLoginTopic, event.getMobileNumber());
        } catch (Exception e) {
            logger.error("❌ Failed to send login event to Kafka: {}", e.getMessage());
        }
    }
}