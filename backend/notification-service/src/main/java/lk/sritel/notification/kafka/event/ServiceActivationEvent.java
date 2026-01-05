package lk.sritel.notification.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceActivationEvent {
    private String serviceId;
    private String userId;
    private String phoneNumber;
    private String email;
    private String serviceName;
    private String serviceType; // ROAMING, DATA, VAS, etc.
    private String status; // ACTIVATED, DEACTIVATED
    private String timestamp;
}