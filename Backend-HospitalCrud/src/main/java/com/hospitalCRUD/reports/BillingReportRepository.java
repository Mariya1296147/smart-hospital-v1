package com.hospitalCRUD.reports;

import com.hospitalCRUD.entity.Billing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BillingReportRepository extends JpaRepository<Billing, Long> {

    Optional<Billing> findByInvoiceId(String invoiceId);

}