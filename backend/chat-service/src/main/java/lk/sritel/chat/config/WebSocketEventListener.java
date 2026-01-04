public class WebSocketEventListener {
    
}
package lk.sritel.chat.config;

import lk.sritel.chat.dto.MessageDto;
import lk.sritel.chat.model.MessageType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messagingTemplate;

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        String roomId = (String) headerAccessor.getSessionAttributes().get("roomId");
        
        if (username != null && roomId != null) {
            log.info("User {} disconnected from room {}", username, roomId);
            
            MessageDto message = MessageDto.builder()
                    .messageType(MessageType.LEAVE.toString())
                    .senderName(username)
                    .content(username + " left the chat")
                    .sentAt(LocalDateTime.now())
                    .build();
            
            messagingTemplate.convertAndSend("/topic/room/" + roomId, message);
        }
    }
}