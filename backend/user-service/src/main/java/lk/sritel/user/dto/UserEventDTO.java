package lk.sritel.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserEventDTO {
    private String eventType; // REGISTRATION, LOGIN, UPDATE
    private Long userId;
    private String mobileNumber;
    private String email;
    private String fullName;
    private LocalDateTime timestamp;
    private String message;
}