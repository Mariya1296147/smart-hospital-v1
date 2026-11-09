package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.BillingPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BillingPaymentRepository extends JpaRepository<BillingPayment, Long> {
    List<BillingPayment> findByBilling_IdOrderByPaidAtDesc(Long billingId);
    Optional<BillingPayment> findByIdAndBilling_Id(Long id, Long billingId);
}
