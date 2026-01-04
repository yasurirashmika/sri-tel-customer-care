package lk.sritel.activation.repository;

import lk.sritel.activation.model.ServiceStatus;
import lk.sritel.activation.model.ServiceType;
import lk.sritel.activation.model.TelcoService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<TelcoService, Long> {
    List<TelcoService> findByUserId(Long userId);
    List<TelcoService> findByUserIdAndStatus(Long userId, ServiceStatus status);
    Optional<TelcoService> findByUserIdAndServiceType(Long userId, ServiceType serviceType);
}