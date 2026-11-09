package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.Discharge;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DischargeRepository extends JpaRepository<Discharge, Long> {
    java.util.List<Discharge> findByPatient_EmailIgnoreCase(String email);
}
