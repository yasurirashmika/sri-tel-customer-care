package lk.sritel.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillItemDto {
    private Long id;
    private String description;
    private String chargeType;
    private BigDecimal amount;
    private Integer quantity;
}