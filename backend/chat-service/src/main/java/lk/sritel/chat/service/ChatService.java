package lk.sritel.chat.service;

import lk.sritel.chat.entity.ChatMessage;
import lk.sritel.chat.repository.ChatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {
    
    private final ChatRepository chatRepository;
    
    /**
     * Save a chat message to the database
     */
    @Transactional
    public ChatMessage saveMessage(String content, String sender, String userId, String sessionId) {
        log.info("Saving message - Sender: {}, Content: {}", sender, content);
        
        ChatMessage message = ChatMessage.builder()
                .content(content)
                .sender(sender)
                .userId(userId)
                .sessionId(sessionId)
                .createdAt(LocalDateTime.now())
                .build();
        
        ChatMessage saved = chatRepository.save(message);
        log.info("Message saved with ID: {}", saved.getId());
        
        return saved;
    }
    
    /**
     * Get chat history for a session
     */
    public List<ChatMessage> getSessionHistory(String sessionId) {
        return chatRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }
    
    /**
     * Get recent messages
     */
    public List<ChatMessage> getRecentMessages() {
        return chatRepository.findTop50ByOrderByCreatedAtDesc();
    }
}
