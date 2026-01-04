package lk.sritel.chat.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "room_id", unique = true, nullable = false)
    private String roomId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "agent_id")
    private Long agentId;
    
    @Enumerated(EnumType.STRING)
    private ChatStatus status;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "closed_at")
    private LocalDateTime closedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = ChatStatus.ACTIVE;
        }
    }
}