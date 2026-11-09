package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.Billing;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillingRepository  extends JpaRepository<Billing, Long> {
    java.util.List<com.hospitalCRUD.entity.Billing> findByPatient_EmailIgnoreCase(String email);
    boolean existsByAppointment_Id(Long appointmentId);
    boolean existsByAppointment_IdAndIdNot(Long appointmentId, Long id);
}
