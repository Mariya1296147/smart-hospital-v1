package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.VitalSign;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VitalSignRepository extends JpaRepository<VitalSign, Long> {
    List<VitalSign> findByNurse_IdOrderByRecordedAtDesc(Long nurseId);
}
