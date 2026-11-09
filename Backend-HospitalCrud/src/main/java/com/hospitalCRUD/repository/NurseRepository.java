package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.Nurse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NurseRepository extends JpaRepository<Nurse, Long> {
    java.util.Optional<Nurse> findByUser_UserName(String userName);
    java.util.Optional<Nurse> findByUser_EmailIgnoreCase(String email);
    java.util.List<Nurse> findByWardRef_Id(Long wardId);
}
