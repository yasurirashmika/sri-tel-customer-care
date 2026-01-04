package lk.sritel.activation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceResponse {
    private Long id;
    private Long userId;
    private String mobileNumber;
    private String serviceType;
    private String serviceName;
    private String serviceCode;
    private String status;
    private LocalDateTime activatedAt;
    private LocalDateTime deactivatedAt;
}