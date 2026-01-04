package lk.sritel.payment.repository;

import lk.sritel.payment.model.Payment;
import lk.sritel.payment.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Payment> findByTransactionId(String transactionId);
    List<Payment> findByStatus(PaymentStatus status);
    List<Payment> findByBillId(Long billId);
}