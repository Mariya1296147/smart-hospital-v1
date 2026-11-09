package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrescriptionRepository  extends JpaRepository<Prescription, Long> {
    java.util.List<Prescription> findByDoctor_EmailIgnoreCase(String email);
    java.util.List<Prescription> findByPatient_EmailIgnoreCase(String email);
}
