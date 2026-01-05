package lk.sritel.notification.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PushNotificationService {
    private static final Logger log = LoggerFactory.getLogger(PushNotificationService.class);
    
    private final SimpMessagingTemplate messagingTemplate;
    
    @Value("${notification.push.enabled:true}")
    private Boolean pushEnabled;
    
    public void sendPushNotification(String userId, String title, String message) {
        if (!Boolean.TRUE.equals(pushEnabled)) {
            log.info("Push notification sending is disabled");
            return;
        }
        
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("title", title);
            notification.put("message", message);
            notification.put("timestamp", LocalDateTime.now().toString());
            notification.put("userId", userId);
            
            // Send to specific user via WebSocket
            messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/notifications",
                notification
            );
            
            log.info("Push notification sent to user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to send push notification to user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to send push notification", e);
        }
    }
    
    public void sendBroadcastNotification(String title, String message) {
        if (!Boolean.TRUE.equals(pushEnabled)) {
            log.info("Push notification sending is disabled");
            return;
        }
        
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("title", title);
            notification.put("message", message);
            notification.put("timestamp", LocalDateTime.now().toString());
            notification.put("type", "broadcast");
            
            // Broadcast to all connected users
            messagingTemplate.convertAndSend("/topic/notifications", notification);
            
            log.info("Broadcast notification sent");
        } catch (Exception e) {
            log.error("Failed to send broadcast notification: {}", e.getMessage());
            throw new RuntimeException("Failed to send broadcast notification", e);
        }
    }
}