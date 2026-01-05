package lk.sritel.notification.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    
    @Value("${notification.email.from:noreply@sritel.lk}")
    private String fromEmail;
    
    @Value("${notification.email.enabled:true}")
    private Boolean emailEnabled;
    
    public void sendEmail(String to, String subject, String message) {
        if (!Boolean.TRUE.equals(emailEnabled)) {
            log.info("Email sending is disabled");
            return;
        }
        
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(to);
            mailMessage.setSubject(subject);
            mailMessage.setText(message);
            
            mailSender.send(mailMessage);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }
    
    public void sendHtmlEmail(String to, String subject, String templateName, Context context) {
        if (!Boolean.TRUE.equals(emailEnabled)) {
            log.info("Email sending is disabled");
            return;
        }
        
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            String htmlContent = templateEngine.process(templateName, context);
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(mimeMessage);
            log.info("HTML email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send HTML email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send HTML email", e);
        }
    }
    
    public void sendBillNotification(String to, String customerName, Double amount, String dueDate) {
        Context context = new Context();
        context.setVariable("customerName", customerName);
        context.setVariable("amount", amount);
        context.setVariable("dueDate", dueDate);
        
        sendHtmlEmail(to, "Your Sri Tel Bill is Ready", "bill-notification", context);
    }
    
    public void sendPaymentSuccessNotification(String to, String customerName, Double amount, String transactionId) {
        Context context = new Context();
        context.setVariable("customerName", customerName);
        context.setVariable("amount", amount);
        context.setVariable("transactionId", transactionId);
        
        sendHtmlEmail(to, "Payment Successful - Sri Tel", "payment-success", context);
    }
}