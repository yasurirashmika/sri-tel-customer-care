package lk.sritel.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long userId;
    private Long billId;
    private String transactionId;
    private BigDecimal amount;
    private String paymentMethod;
    private String status;
    private String cardLastFour;
    private LocalDateTime createdAt;
}