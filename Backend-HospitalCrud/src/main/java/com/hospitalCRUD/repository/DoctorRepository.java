package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository
        extends JpaRepository<Doctor, Long> {

    boolean existsByDoctorId(String doctorId);

    java.util.Optional<Doctor> findFirstByNameIgnoreCase(String name);
    java.util.Optional<Doctor> findFirstByEmailIgnoreCase(String email);

    java.util.Optional<Doctor> findByUser_UserName(String userName);
}
