package lk.sritel.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private String roomId;
    private Long senderId;
    private String senderName;
    private String messageType;
    private String content;
    private LocalDateTime sentAt;
}