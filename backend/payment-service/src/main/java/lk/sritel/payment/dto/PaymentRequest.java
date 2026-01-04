package lk.sritel.payment.dto;

import lk.sritel.payment.model.PaymentMethod;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private Long userId;
    private Long billId;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private String cardNumber;
    private String cardExpiry;
    private String cvv;
    private String cardHolderName;
}