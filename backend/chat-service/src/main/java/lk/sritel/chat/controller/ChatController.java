package lk.sritel.chat.controller;

import lk.sritel.chat.entity.ChatMessage;
import lk.sritel.chat.service.ChatService;
import lk.sritel.chat.service.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {
    
    private final ChatService chatService;
    private final GeminiService geminiService;
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * Handle incoming chat messages via WebSocket
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload Map<String, String> message) {
        try {
            String content = message.get("content");
            String userId = message.getOrDefault("userId", "anonymous");
            String sessionId = message.getOrDefault("sessionId", "default");
            
            log.info("Received message from user {}: {}", userId, content);
            
            // Step 1: Save user message
            ChatMessage userMessage = chatService.saveMessage(content, "USER", userId, sessionId);
            
            // Step 2: Broadcast user message to all clients
            Map<String, Object> userMessagePayload = buildMessagePayload(userMessage);
            messagingTemplate.convertAndSend("/topic/public", userMessagePayload);
            log.info("Broadcasted user message to /topic/public");
            
            // Step 3: Asynchronously generate and send AI response
            CompletableFuture.runAsync(() -> {
                try {
                    log.info("Generating AI response asynchronously...");
                    
                    // Call Gemini API
                    String aiResponse = geminiService.generateResponse(content);
                    
                    // Save AI response
                    ChatMessage aiMessage = chatService.saveMessage(aiResponse, "AI", "system", sessionId);
                    
                    // Broadcast AI response
                    Map<String, Object> aiMessagePayload = buildMessagePayload(aiMessage);
                    messagingTemplate.convertAndSend("/topic/public", aiMessagePayload);
                    log.info("Broadcasted AI response to /topic/public");
                    
                } catch (Exception e) {
                    log.error("Error generating AI response: {}", e.getMessage(), e);
                    
                    // Send error message
                    ChatMessage errorMessage = chatService.saveMessage(
                            "Sorry, I'm having trouble processing your request. Please try again.",
                            "AI",
                            "system",
                            sessionId
                    );
                    Map<String, Object> errorPayload = buildMessagePayload(errorMessage);
                    messagingTemplate.convertAndSend("/topic/public", errorPayload);
                }
            });
            
        } catch (Exception e) {
            log.error("Error processing message: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Build message payload for WebSocket broadcast
     */
    private Map<String, Object> buildMessagePayload(ChatMessage message) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", message.getId());
        payload.put("content", message.getContent());
        payload.put("sender", message.getSender());
        payload.put("userId", message.getUserId());
        payload.put("timestamp", message.getCreatedAt().toString());
        return payload;
    }
}

/**
 * REST Controller for HTTP endpoints
 */
@RestController
@RequiredArgsConstructor
@Slf4j
class ChatRestController {
    
    private final ChatService chatService;
    
    @GetMapping("/api/chat/history")
    public List<ChatMessage> getChatHistory(@RequestParam(required = false) String sessionId) {
        if (sessionId != null && !sessionId.isEmpty()) {
            return chatService.getSessionHistory(sessionId);
        }
        return chatService.getRecentMessages();
    }
}
