package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    java.util.List<Consultation> findByDoctor_EmailIgnoreCase(String email);
    java.util.List<Consultation> findByPatient_EmailIgnoreCase(String email);
}
