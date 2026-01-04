package lk.sritel.activation.dto;

import lk.sritel.activation.model.ServiceType;
import lombok.Data;

@Data
public class ServiceRequest {
    private Long userId;
    private String mobileNumber;
    private ServiceType serviceType;
    private String serviceName;
    private String serviceCode;
}