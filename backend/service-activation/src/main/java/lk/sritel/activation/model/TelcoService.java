package lk.sritel.activation.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "telco_services")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TelcoService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "mobile_number")
    private String mobileNumber;
    
    @Enumerated(EnumType.STRING)
    private ServiceType serviceType;
    
    private String serviceName;
    private String serviceCode;
    
    @Enumerated(EnumType.STRING)
    private ServiceStatus status;
    
    @Column(name = "activated_at")
    private LocalDateTime activatedAt;
    
    @Column(name = "deactivated_at")
    private LocalDateTime deactivatedAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}