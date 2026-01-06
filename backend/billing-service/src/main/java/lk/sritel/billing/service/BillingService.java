package lk.sritel.billing.service;

import lk.sritel.billing.dto.BillItemDto;
import lk.sritel.billing.dto.BillResponse;
import lk.sritel.billing.model.*;
import lk.sritel.billing.repository.BillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
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
        String billNumber = "BILL-" + System.currentTimeMillis();
        
        // 1. Create bill entity
        Bill bill = Bill.builder()
                .userId(userId)
                .mobileNumber("0771234567") // Fallback mobile
                .billNumber(billNumber)
                .billingPeriod(LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM yyyy")))
                .billDate(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(15))
                .totalAmount(BigDecimal.ZERO)
                .paidAmount(BigDecimal.ZERO)
                .status(BillStatus.UNPAID)
                .items(new ArrayList<>()) // Initialize list
                .build();

        // 2. Add sample bill items
        bill.getItems().add(BillItem.builder().bill(bill).description("Voice calls").chargeType(ChargeType.VOICE_CALLS).amount(new BigDecimal("450.00")).quantity(120).build());
        bill.getItems().add(BillItem.builder().bill(bill).description("Data usage (5GB)").chargeType(ChargeType.DATA_USAGE).amount(new BigDecimal("850.00")).quantity(5).build());
        bill.getItems().add(BillItem.builder().bill(bill).description("SMS").chargeType(ChargeType.SMS).amount(new BigDecimal("100.00")).quantity(50).build());
        bill.getItems().add(BillItem.builder().bill(bill).description("Monthly subscription").chargeType(ChargeType.SUBSCRIPTION).amount(new BigDecimal("500.00")).quantity(1).build());
        
        // 3. Calculate total and save
        BigDecimal total = bill.getItems().stream()
                .map(BillItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        bill.setTotalAmount(total);
        
        bill = billRepository.save(bill);
        
        // 4. Fetch Registered User Email from User-Service
        String phoneNumber = bill.getMobileNumber();
        String registeredEmail = "customer@sritel.lk"; // Fallback email
        
        try {
            RestTemplate restTemplate = new RestTemplate();
            // Assuming your User Service is on port 8080 (Gateway)
            String userUrl = "http://localhost:8080/api/users/" + userId;
            Map<String, Object> userResponse = restTemplate.getForObject(userUrl, Map.class);
            
            if (userResponse != null) {
                if (userResponse.get("email") != null) registeredEmail = userResponse.get("email").toString();
                if (userResponse.get("mobileNumber") != null) phoneNumber = userResponse.get("mobileNumber").toString();
            }
        } catch (Exception ex) {
            log.warn("Could not fetch user info for ID {}: {}. Using fallback details.", userId, ex.getMessage());
        }
        
        // 5. Publish Event to Kafka
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", "BILL_GENERATED");
        event.put("billId", String.valueOf(bill.getId()));
        event.put("userId", String.valueOf(bill.getUserId()));
        event.put("phoneNumber", phoneNumber);
        event.put("email", registeredEmail); // SENT TO KAFKA
        event.put("billNumber", bill.getBillNumber());
        event.put("amount", bill.getTotalAmount().doubleValue());
        event.put("dueDate", bill.getDueDate().toString());
        event.put("billingPeriod", bill.getBillingPeriod());
        event.put("timestamp", System.currentTimeMillis());
        
        kafkaTemplate.send("billing-events", event);
        kafkaTemplate.send("notification-events", event);
        
        log.info("Bill generated and events published for User: {} ({})", userId, registeredEmail);
        
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
    
    @Scheduled(cron = "0 0 0 1 * ?")
    public void generateMonthlyBills() {
        log.info("Starting scheduled monthly billing task...");
    }
    
    @Scheduled(cron = "0 0 8 * * ?")
    public void checkOverdueBills() {
        List<Bill> unpaidBills = billRepository.findByStatus(BillStatus.UNPAID);
        LocalDateTime now = LocalDateTime.now();
        
        for (Bill bill : unpaidBills) {
            if (bill.getDueDate().isBefore(now)) {
                bill.setStatus(BillStatus.OVERDUE);
                billRepository.save(bill);
                
                Map<String, Object> event = new HashMap<>();
                event.put("eventType", "BILL_OVERDUE");
                event.put("billId", bill.getId());
                event.put("userId", bill.getUserId());
                event.put("amount", bill.getTotalAmount());
                kafkaTemplate.send("notification-events", event);
            }
        }
    }
    
    private BillResponse mapToResponse(Bill bill) {
        List<BillItem> items = bill.getItems() != null ? bill.getItems() : new ArrayList<>();
        List<BillItemDto> itemDtos = items.stream()
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