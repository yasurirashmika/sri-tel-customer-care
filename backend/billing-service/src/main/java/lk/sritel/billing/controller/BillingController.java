package lk.sritel.billing.controller;

import lk.sritel.billing.dto.BillResponse;
import lk.sritel.billing.service.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class BillingController {
    
    private final BillingService billingService;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BillResponse>> getUserBills(@PathVariable Long userId) {
        return ResponseEntity.ok(billingService.getUserBills(userId));
    }
    
    @GetMapping("/mobile/{mobileNumber}")
    public ResponseEntity<List<BillResponse>> getBillsByMobile(@PathVariable String mobileNumber) {
        return ResponseEntity.ok(billingService.getBillsByMobile(mobileNumber));
    }
    
    @GetMapping("/{billId}")
    public ResponseEntity<BillResponse> getBillById(@PathVariable Long billId) {
        return ResponseEntity.ok(billingService.getBillById(billId));
    }
    
    @GetMapping("/number/{billNumber}")
    public ResponseEntity<BillResponse> getBillByNumber(@PathVariable String billNumber) {
        return ResponseEntity.ok(billingService.getBillByNumber(billNumber));
    }
    
    @GetMapping("/user/{userId}/unpaid")
    public ResponseEntity<List<BillResponse>> getUnpaidBills(@PathVariable Long userId) {
        return ResponseEntity.ok(billingService.getUnpaidBills(userId));
    }
    
    @PostMapping("/generate/{userId}")
    public ResponseEntity<BillResponse> generateBill(@PathVariable Long userId) {
        return ResponseEntity.ok(billingService.generateBill(userId));
    }
}