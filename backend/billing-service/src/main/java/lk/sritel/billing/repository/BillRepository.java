package lk.sritel.billing.repository;

import lk.sritel.billing.model.Bill;
import lk.sritel.billing.model.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByUserIdOrderByBillDateDesc(Long userId);
    List<Bill> findByMobileNumberOrderByBillDateDesc(String mobileNumber);
    Optional<Bill> findByBillNumber(String billNumber);
    List<Bill> findByStatus(BillStatus status);
    List<Bill> findByUserIdAndStatus(Long userId, BillStatus status);
}