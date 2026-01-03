package lk.sritel.billing.service;

import lk.sritel.billing.dto.BillItemDto;
import lk.sritel.billing.dto.BillResponse;
import lk.sritel.billing.model.*;
import lk.sritel.billing.repository.BillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillingService {
    
    private final BillRepository billRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    public List<BillResponse> getUserBills(Long userId) {
        return billRepository.findByUserIdOrderByBillDateDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<BillResponse> getBillsByMobile(String mobileNumber) {
        return billRepository.findByMobileNumberOrderByBillDateDesc(mobileNumber)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public BillResponse getBillById(Long billId) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new RuntimeException("Bill not found"));
        return mapToResponse(bill);
    }
    
    public BillResponse getBillByNumber(String billNumber) {
        Bill bill = billRepository.findByBillNumber(billNumber)
                .orElseThrow(() -> new RuntimeException("Bill not found"));
        return mapToResponse(bill);
    }
    
    public List<BillResponse> getUnpaidBills(Long userId) {
        return billRepository.findByUserIdAndStatus(userId, BillStatus.UNPAID)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public BillResponse generateBill(Long userId) {
        // Generate bill number
        String billNumber = "BILL-" + System.currentTimeMillis();
        
        // Create bill with sample data
        Bill bill = Bill.builder()
                .userId(userId)
                .mobileNumber("0771234567") // In production, fetch from user service
                .billNumber(billNumber)
                .billingPeriod(LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM yyyy")))
                .billDate(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(15))
                .totalAmount(BigDecimal.ZERO)
                .paidAmount(BigDecimal.ZERO)
                .status(BillStatus.UNPAID)
                .build();
        
        // Add sample bill items
        BillItem voiceCharges = BillItem.builder()
                .bill(bill)
                .description("Voice calls")
                .chargeType(ChargeType.VOICE_CALLS)
                .amount(new BigDecimal("450.00"))
                .quantity(120)
                .build();
        
        BillItem dataCharges = BillItem.builder()
                .bill(bill)
                .description("Data usage (5GB)")
                .chargeType(ChargeType.DATA_USAGE)
                .amount(new BigDecimal("850.00"))
                .quantity(5)
                .build();
        
        BillItem smsCharges = BillItem.builder()
                .bill(bill)
                .description("SMS")
                .chargeType(ChargeType.SMS)
                .amount(new BigDecimal("100.00"))
                .quantity(50)
                .build();
        
        BillItem subscription = BillItem.builder()
                .bill(bill)
                .description("Monthly subscription")
                .chargeType(ChargeType.SUBSCRIPTION)
                .amount(new BigDecimal("500.00"))
                .quantity(1)
                .build();
        
        bill.getItems().addAll(Arrays.asList(voiceCharges, dataCharges, smsCharges, subscription));
        
        // Calculate total
        BigDecimal total = bill.getItems().stream()
                .map(BillItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        bill.setTotalAmount(total);
        
        bill = billRepository.save(bill);
        
        // Publish bill generated event
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", "BILL_GENERATED");
        event.put("billId", bill.getId());
        event.put("userId", bill.getUserId());
        event.put("mobileNumber", bill.getMobileNumber());
        event.put("billNumber", bill.getBillNumber());
        event.put("amount", bill.getTotalAmount());
        event.put("dueDate", bill.getDueDate().toString());
        event.put("timestamp", System.currentTimeMillis());
        
        kafkaTemplate.send("bill-events", event);
        kafkaTemplate.send("notification-events", event);
        
        return mapToResponse(bill);
    }
    
    @KafkaListener(topics = "payment-events", groupId = "billing-service")
    public void handlePaymentEvent(Map<String, Object> event) {
        String eventType = (String) event.get("eventType");
        
        if ("PAYMENT_COMPLETED".equals(eventType)) {
            Long billId = Long.valueOf(event.get("billId").toString());
            BigDecimal paidAmount = new BigDecimal(event.get("amount").toString());
            
            updateBillPaymentStatus(billId, paidAmount);
        }
    }
    
    @Transactional
    public void updateBillPaymentStatus(Long billId, BigDecimal paidAmount) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new RuntimeException("Bill not found"));
        
        bill.setPaidAmount(bill.getPaidAmount().add(paidAmount));
        
        if (bill.getPaidAmount().compareTo(bill.getTotalAmount()) >= 0) {
            bill.setStatus(BillStatus.PAID);
        } else if (bill.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
            bill.setStatus(BillStatus.PARTIALLY_PAID);
        }
        
        billRepository.save(bill);
    }
    
    // Scheduled task to generate monthly bills (runs on 1st of every month)
    @Scheduled(cron = "0 0 0 1 * ?")
    public void generateMonthlyBills() {
        // In production, fetch all active users and generate bills
        System.out.println("Generating monthly bills...");
    }
    
    // Scheduled task to check overdue bills (runs daily)
    @Scheduled(cron = "0 0 8 * * ?")
    public void checkOverdueBills() {
        List<Bill> unpaidBills = billRepository.findByStatus(BillStatus.UNPAID);
        LocalDateTime now = LocalDateTime.now();
        
        for (Bill bill : unpaidBills) {
            if (bill.getDueDate().isBefore(now)) {
                bill.setStatus(BillStatus.OVERDUE);
                billRepository.save(bill);
                
                // Send overdue notification
                Map<String, Object> event = new HashMap<>();
                event.put("eventType", "BILL_OVERDUE");
                event.put("billId", bill.getId());
                event.put("userId", bill.getUserId());
                event.put("mobileNumber", bill.getMobileNumber());
                event.put("amount", bill.getTotalAmount());
                event.put("timestamp", System.currentTimeMillis());
                
                kafkaTemplate.send("notification-events", event);
            }
        }
    }
    
    private BillResponse mapToResponse(Bill bill) {
        List<BillItemDto> itemDtos = bill.getItems().stream()
                .map(item -> BillItemDto.builder()
                        .id(item.getId())
                        .description(item.getDescription())
                        .chargeType(item.getChargeType().toString())
                        .amount(item.getAmount())
                        .quantity(item.getQuantity())
                        .build())
                .collect(Collectors.toList());
        
        return BillResponse.builder()
                .id(bill.getId())
                .userId(bill.getUserId())
                .mobileNumber(bill.getMobileNumber())
                .billNumber(bill.getBillNumber())
                .billingPeriod(bill.getBillingPeriod())
                .billDate(bill.getBillDate())
                .dueDate(bill.getDueDate())
                .totalAmount(bill.getTotalAmount())
                .paidAmount(bill.getPaidAmount())
                .status(bill.getStatus().toString())
                .items(itemDtos)
                .createdAt(bill.getCreatedAt())
                .build();
    }
}