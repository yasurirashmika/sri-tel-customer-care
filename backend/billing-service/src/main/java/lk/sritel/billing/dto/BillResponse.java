package lk.sritel.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillResponse {
    private Long id;
    private Long userId;
    private String mobileNumber;
    private String billNumber;
    private String billingPeriod;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private String status;
    private LocalDateTime billDate;
    private LocalDateTime dueDate;
    private LocalDateTime paidDate;
    private List<BillItemDto> items;  // No more inner class
    private LocalDateTime createdAt;
    
}