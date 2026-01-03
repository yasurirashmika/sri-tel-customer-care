package lk.sritel.billing.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "bill_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "bill_id", nullable = false)
    @ToString.Exclude
    private Bill bill;
    
    private String description;
    
    @Enumerated(EnumType.STRING)
    private ChargeType chargeType;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal amount;
    
    private Integer quantity;
}