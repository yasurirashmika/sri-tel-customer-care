package lk.sritel.chat.controller;

import lk.sritel.chat.dto.MessageDto;
import lk.sritel.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {
    
    private final ChatService chatService;
    
    @MessageMapping("/chat/{roomId}/send")
    @SendTo("/topic/room/{roomId}")
    public MessageDto sendMessage(
            @DestinationVariable String roomId,
            @Payload MessageDto message) {
        log.info("Message received for room {}: {}", roomId, message.getContent());
        return chatService.saveAndBroadcastMessage(roomId, message);
    }
    
    @MessageMapping("/chat/{roomId}/join")
    @SendTo("/topic/room/{roomId}")
    public MessageDto addUser(
            @DestinationVariable String roomId,
            @Payload MessageDto message,
            SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("username", message.getSenderName());
        headerAccessor.getSessionAttributes().put("roomId", roomId);
        log.info("User {} joined room {}", message.getSenderName(), roomId);
        return message;
    }
    
    @MessageMapping("/chat/{roomId}/typing")
    @SendTo("/topic/room/{roomId}/typing")
    public MessageDto userTyping(
            @DestinationVariable String roomId,
            @Payload MessageDto message) {
        return message;
    }
}