package lk.sritel.chat.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "room_id", nullable = false)
    private String roomId;
    
    @Column(name = "sender_id", nullable = false)
    private Long senderId;
    
    @Column(name = "sender_name")
    private String senderName;
    
    @Enumerated(EnumType.STRING)
    private MessageType messageType;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "sent_at")
    private LocalDateTime sentAt;
    
    @PrePersist
    protected void onCreate() {
        sentAt = LocalDateTime.now();
    }
}