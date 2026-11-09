package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.Laboratory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LaboratoryRepository  extends JpaRepository<Laboratory, Long> {
    boolean existsByPatient_Id(Long patientId);
    java.util.List<Laboratory> findByDoctor_EmailIgnoreCase(String email);
    java.util.List<Laboratory> findByPatient_EmailIgnoreCase(String email);
}
