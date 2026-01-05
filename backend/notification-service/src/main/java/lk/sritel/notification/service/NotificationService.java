package lk.sritel.notification.service;

import lk.sritel.notification.dto.NotificationHistoryDTO;
import lk.sritel.notification.dto.NotificationRequest;
import lk.sritel.notification.dto.NotificationResponse;
import lk.sritel.notification.model.Notification;
import lk.sritel.notification.model.NotificationStatus;
import lk.sritel.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final SmsService smsService;
    private final PushNotificationService pushNotificationService;
    
    @Async
    @Transactional
    public void sendNotification(NotificationRequest request) {
        log.info("Processing notification for user: {}", request.getUserId());
        
        // Create notification entity
        Notification notification = new Notification();
        notification.setUserId(request.getUserId());
        notification.setPhoneNumber(request.getPhoneNumber());
        notification.setEmail(request.getEmail());
        notification.setType(request.getType());
        notification.setSubject(request.getSubject());
        notification.setMessage(request.getMessage());
        notification.setStatus(NotificationStatus.PENDING);
        notification.setMetadata(request.getMetadata());
        
        notification = notificationRepository.save(notification);
        
        boolean emailSent = false;
        boolean smsSent = false;
        boolean pushSent = false;
        StringBuilder errors = new StringBuilder();
        
        // Send Email
        if (Boolean.TRUE.equals(request.getSendEmail())) {
            try {
                emailService.sendEmail(
                    request.getEmail(),
                    request.getSubject(),
                    request.getMessage()
                );
                emailSent = true;
                notification.setSentViaEmail(true);
                log.info("Email sent successfully to: {}", request.getEmail());
            } catch (Exception e) {
                log.error("Failed to send email: {}", e.getMessage());
                errors.append("Email: ").append(e.getMessage()).append("; ");
            }
        }
        
        // Send SMS
        if (Boolean.TRUE.equals(request.getSendSms())) {
            try {
                smsService.sendSms(request.getPhoneNumber(), request.getMessage());
                smsSent = true;
                notification.setSentViaSms(true);
                log.info("SMS sent successfully to: {}", request.getPhoneNumber());
            } catch (Exception e) {
                log.error("Failed to send SMS: {}", e.getMessage());
                errors.append("SMS: ").append(e.getMessage()).append("; ");
            }
        }
        
        // Send Push Notification
        if (Boolean.TRUE.equals(request.getSendPush())) {
            try {
                pushNotificationService.sendPushNotification(
                    request.getUserId(),
                    request.getSubject(),
                    request.getMessage()
                );
                pushSent = true;
                notification.setSentViaPush(true);
                log.info("Push notification sent successfully to user: {}", request.getUserId());
            } catch (Exception e) {
                log.error("Failed to send push notification: {}", e.getMessage());
                errors.append("Push: ").append(e.getMessage()).append("; ");
            }
        }
        
        // Update notification status
        if (emailSent || smsSent || pushSent) {
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
        } else {
            notification.setStatus(NotificationStatus.FAILED);
            notification.setErrorMessage(errors.toString());
        }
        
        notificationRepository.save(notification);
    }
    
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(String userId) {
        return notificationRepository.findByUserId(userId)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Page<NotificationHistoryDTO> getUserNotificationHistory(String userId, Pageable pageable) {
        return notificationRepository.findByUserId(userId, pageable)
            .map(this::mapToHistoryDTO);
    }
    
    @Transactional(readOnly = true)
    public NotificationResponse getNotificationById(Long id) {
        Notification notification = notificationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        return mapToResponse(notification);
    }
    
    private NotificationResponse mapToResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setUserId(notification.getUserId());
        response.setType(notification.getType());
        response.setSubject(notification.getSubject());
        response.setMessage(notification.getMessage());
        response.setStatus(notification.getStatus());
        response.setSentViaEmail(notification.getSentViaEmail());
        response.setSentViaSms(notification.getSentViaSms());
        response.setSentViaPush(notification.getSentViaPush());
        response.setCreatedAt(notification.getCreatedAt());
        response.setSentAt(notification.getSentAt());
        response.setErrorMessage(notification.getErrorMessage());
        return response;
    }
    
    private NotificationHistoryDTO mapToHistoryDTO(Notification notification) {
        NotificationHistoryDTO dto = new NotificationHistoryDTO();
        dto.setId(notification.getId());
        dto.setType(notification.getType());
        dto.setSubject(notification.getSubject());
        dto.setStatus(notification.getStatus());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setSentAt(notification.getSentAt());
        return dto;
    }
}