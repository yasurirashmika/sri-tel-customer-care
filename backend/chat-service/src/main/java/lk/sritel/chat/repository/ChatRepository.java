package lk.sritel.chat.repository;

import lk.sritel.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<ChatMessage, Long> {
    
    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(String sessionId);
    
    List<ChatMessage> findByUserIdOrderByCreatedAtDesc(String userId);
    
    List<ChatMessage> findTop50ByOrderByCreatedAtDesc();
}
