package lk.sritel.notification.dto;

import lk.sritel.notification.model.NotificationStatus;
import lk.sritel.notification.model.NotificationType;

import java.time.LocalDateTime;

public class NotificationResponse {
    
    private Long id;
    private String userId;
    private NotificationType type;
    private String subject;
    private String message;
    private NotificationStatus status;
    private Boolean sentViaEmail;
    private Boolean sentViaSms;
    private Boolean sentViaPush;
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;
    private String errorMessage;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public NotificationStatus getStatus() { return status; }
    public void setStatus(NotificationStatus status) { this.status = status; }
    public Boolean getSentViaEmail() { return sentViaEmail; }
    public void setSentViaEmail(Boolean sentViaEmail) { this.sentViaEmail = sentViaEmail; }
    public Boolean getSentViaSms() { return sentViaSms; }
    public void setSentViaSms(Boolean sentViaSms) { this.sentViaSms = sentViaSms; }
    public Boolean getSentViaPush() { return sentViaPush; }
    public void setSentViaPush(Boolean sentViaPush) { this.sentViaPush = sentViaPush; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}