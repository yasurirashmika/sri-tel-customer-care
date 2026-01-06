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

        // 2. Fetch active services from Service Activation microservice
        List<Map<String, Object>> activeServices = fetchUserActiveServices(userId);
        
        // Add base subscription fee
        bill.getItems().add(BillItem.builder()
                .bill(bill)
                .description("Base Monthly Subscription")
                .chargeType(ChargeType.SUBSCRIPTION)
                .amount(new BigDecimal("200.00"))
                .quantity(1)
                .build());
        
        // 3. Add bill items based on active services
        if (activeServices != null && !activeServices.isEmpty()) {
            for (Map<String, Object> service : activeServices) {
                String serviceType = (String) service.get("serviceType");
                String serviceName = (String) service.get("serviceName");
                BigDecimal serviceCharge = getServiceCharge(serviceType);
                ChargeType chargeType = mapServiceTypeToChargeType(serviceType);
                
                if (serviceCharge.compareTo(BigDecimal.ZERO) > 0) {
                    bill.getItems().add(BillItem.builder()
                            .bill(bill)
                            .description(serviceName != null ? serviceName : serviceType)
                            .chargeType(chargeType)
                            .amount(serviceCharge)
                            .quantity(1)
                            .build());
                }
            }
        } else {
            // No active services - only base subscription
            log.info("No active services found for user {}. Billing base subscription only.", userId);
        }
        
        // 4. Calculate total and save
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
    
    // Fetch active services from Service Activation microservice
    private List<Map<String, Object>> fetchUserActiveServices(Long userId) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String serviceUrl = "http://localhost:8080/api/services/user/" + userId + "/active";
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> services = restTemplate.getForObject(serviceUrl, List.class);
            
            log.info("Fetched {} active services for user {}", 
                    services != null ? services.size() : 0, userId);
            return services;
        } catch (Exception ex) {
            log.warn("Could not fetch active services for user {}: {}. Using base subscription only.", 
                    userId, ex.getMessage());
            return new ArrayList<>();
        }
    }
    
    // Get monthly charge for each service type
    private BigDecimal getServiceCharge(String serviceType) {
        return switch (serviceType) {
            case "DATA_PACKAGE" -> new BigDecimal("500.00");
            case "VOICE_PACKAGE" -> new BigDecimal("300.00");
            case "SMS_PACKAGE" -> new BigDecimal("150.00");
            case "INTERNATIONAL_ROAMING" -> new BigDecimal("2000.00");
            case "RING_TONE" -> new BigDecimal("50.00");
            case "CALLER_TUNE" -> new BigDecimal("75.00");
            case "VAS_OTHER" -> new BigDecimal("100.00");
            default -> {
                log.warn("Unknown service type: {}. Using default charge.", serviceType);
                yield new BigDecimal("100.00");
            }
        };
    }
    
    // Map service type to charge type
    private ChargeType mapServiceTypeToChargeType(String serviceType) {
        return switch (serviceType) {
            case "DATA_PACKAGE" -> ChargeType.DATA_USAGE;
            case "VOICE_PACKAGE" -> ChargeType.VOICE_CALLS;
            case "SMS_PACKAGE" -> ChargeType.SMS;
            case "INTERNATIONAL_ROAMING" -> ChargeType.ROAMING;
            case "RING_TONE", "CALLER_TUNE", "VAS_OTHER" -> ChargeType.VAS_SERVICE;
            default -> ChargeType.OTHER;
        };
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