package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.Admission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface AdmissionRepository
        extends JpaRepository<Admission, Long> {

    boolean existsByPatient_IdAndStatusIn(Long patientId, Collection<String> statuses);
    boolean existsBySourcePrescription_Id(Long prescriptionId);
    java.util.Optional<Admission> findFirstBySourcePrescription_Id(Long prescriptionId);
    java.util.Optional<Admission> findFirstByPatient_IdAndStatusInOrderByAdmissionDateDesc(Long patientId, Collection<String> statuses);

    List<Admission> findByPatient_IdAndStatusIn(Long patientId, Collection<String> statuses);

    List<Admission> findByPatient_EmailIgnoreCase(String email);

    boolean existsByPatient_IdAndWard_Id(Long patientId, Long wardId);
    boolean existsByPatient_IdAndWard_IdAndStatusIn(Long patientId, Long wardId, Collection<String> statuses);

    List<Admission> findByWard_Id(Long wardId);
    List<Admission> findByWard_IdAndStatusInOrderByAdmissionDateDesc(Long wardId, Collection<String> statuses);

    boolean existsByBed_IdAndStatusIn(Long bedId, Collection<String> statuses);

    boolean existsByPatient_IdAndAssignedNurse_IdAndStatusIn(Long patientId, Long nurseId, Collection<String> statuses);
    long countByAssignedNurse_IdAndStatusIn(Long nurseId, Collection<String> statuses);
    List<Admission> findByAssignedNurse_IdAndStatusInOrderByAdmissionDateDesc(Long nurseId, Collection<String> statuses);
}
