package com.hospitalCRUD.service;

import com.hospitalCRUD.entity.Discharge;
import com.hospitalCRUD.entity.Admission;
import com.hospitalCRUD.entity.Bed;
import com.hospitalCRUD.entity.Patient;
import com.hospitalCRUD.entity.Doctor;
import com.hospitalCRUD.entity.Department;
import com.hospitalCRUD.repository.AdmissionRepository;
import com.hospitalCRUD.repository.BedRepository;
import com.hospitalCRUD.repository.DischargeRepository;
import com.hospitalCRUD.repository.PatientRepository;
import com.hospitalCRUD.repository.DoctorRepository;
import com.hospitalCRUD.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DischargeService {

    private final DischargeRepository dischargeRepository;
    private final AdmissionRepository admissionRepository;
    private final BedRepository bedRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;

    public List<Discharge> getAll() {
        return dischargeRepository.findAll();
    }

    public Discharge getById(Long id) {
        return dischargeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Discharge not found"));
    }

    @Transactional
    public Discharge create(Discharge discharge) {
        if (discharge.getPatient() == null || discharge.getPatient().getId() == null) {
            throw new IllegalArgumentException("A valid patient must be selected for discharge");
        }
        Patient patient = patientRepository.findById(discharge.getPatient().getId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        discharge.setPatient(patient);
        Doctor doctor = discharge.getDoctor() == null || discharge.getDoctor().getId() == null ? null
                : doctorRepository.findById(discharge.getDoctor().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        discharge.setDoctor(doctor);
        Department department = discharge.getDepartment() == null || discharge.getDepartment().getId() == null ? null
                : departmentRepository.findById(discharge.getDepartment().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        discharge.setDepartment(department);
        if (!StringUtils.hasText(discharge.getDischargeId())) {
            discharge.setDischargeId("DIS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (discharge.getDischargeDate() == null) discharge.setDischargeDate(LocalDate.now());

        Admission admission = findActiveAdmission(patient.getId());
        if (admission == null) {
            throw new IllegalStateException("The patient has no active admission to discharge");
        }
        discharge.setAdmission(admission);
        discharge.setAdmissionDate(admission.getAdmissionDate());
        if (admission.getDoctor() != null && discharge.getDoctor() == null) discharge.setDoctor(admission.getDoctor());
        if (admission.getDepartment() != null && discharge.getDepartment() == null) discharge.setDepartment(admission.getDepartment());
        if (admission.getBed() != null) {
            Bed bed = admission.getBed();
            discharge.setBed(bed.getBedNumber());
            discharge.setRoom(admission.getWard() == null ? null : admission.getWard().getWardName());
            bed.setStatus("AVAILABLE");
            bedRepository.save(bed);
        }
        admission.setDischargeDate(discharge.getDischargeDate());
        admission.setStatus("DISCHARGED");
        admissionRepository.save(admission);
        return dischargeRepository.save(discharge);
    }

    @Transactional
    public Discharge update(Long id, Discharge discharge) {
        Discharge existing = getById(id);

        if (StringUtils.hasText(discharge.getDischargeId())) existing.setDischargeId(discharge.getDischargeId());
        if (discharge.getPatient() != null && discharge.getPatient().getId() != null) {
            existing.setPatient(patientRepository.findById(discharge.getPatient().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Patient not found")));
        }
        if (discharge.getDoctor() != null && discharge.getDoctor().getId() != null) {
            existing.setDoctor(doctorRepository.findById(discharge.getDoctor().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Doctor not found")));
        }
        if (discharge.getDepartment() != null && discharge.getDepartment().getId() != null) {
            existing.setDepartment(departmentRepository.findById(discharge.getDepartment().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found")));
        }
        if (discharge.getDischargeDate() != null) {
            existing.setDischargeDate(discharge.getDischargeDate());
            if (existing.getAdmission() != null) {
                existing.getAdmission().setDischargeDate(discharge.getDischargeDate());
                admissionRepository.save(existing.getAdmission());
            }
        }
        if (discharge.getAdmission() != null && discharge.getAdmission().getId() != null) {
            existing.setAdmission(admissionRepository.findById(discharge.getAdmission().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Admission not found")));
        }
        if (discharge.getAdmissionDate() != null) existing.setAdmissionDate(discharge.getAdmissionDate());
        if (discharge.getRoom() != null) existing.setRoom(discharge.getRoom());
        if (discharge.getBed() != null) existing.setBed(discharge.getBed());
        if (discharge.getDischargeType() != null) existing.setDischargeType(discharge.getDischargeType());
        if (discharge.getDiagnosis() != null) existing.setDiagnosis(discharge.getDiagnosis());
        if (discharge.getTreatment() != null) existing.setTreatment(discharge.getTreatment());
        if (discharge.getPrescription() != null) existing.setPrescription(discharge.getPrescription());
        if (discharge.getInstructions() != null) existing.setInstructions(discharge.getInstructions());


        return dischargeRepository.save(existing);
    }

    public void delete(Long id) {
        dischargeRepository.deleteById(id);
    }

    private Admission findActiveAdmission(Long patientId) {
        return admissionRepository.findByPatient_IdAndStatusIn(patientId,
                        List.of("ADMITTED", "ACTIVE", "IN_PROGRESS"))
                .stream().findFirst().orElse(null);
    }
}
