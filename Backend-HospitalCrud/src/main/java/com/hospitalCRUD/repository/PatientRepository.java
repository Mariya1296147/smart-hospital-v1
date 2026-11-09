package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientRepository
        extends JpaRepository<Patient, Long> {
    Optional<Patient> findByEmailIgnoreCase(String email);

    java.util.Optional<Patient> findFirstByPatientId(String patientId);
    java.util.Optional<Patient> findFirstByNameIgnoreCase(String name);

    java.util.Optional<Patient> findByUser_UserName(String userName);
}
