package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.NursingNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NursingNoteRepository extends JpaRepository<NursingNote, Long> {
    List<NursingNote> findByNurse_IdOrderByRecordedAtDesc(Long nurseId);
}
