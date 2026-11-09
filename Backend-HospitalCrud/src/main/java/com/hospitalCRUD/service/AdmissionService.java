package com.hospitalCRUD.service;

import com.hospitalCRUD.entity.Admission;
import com.hospitalCRUD.entity.Bed;
import com.hospitalCRUD.entity.Patient;
import com.hospitalCRUD.entity.Doctor;
import com.hospitalCRUD.entity.Department;
import com.hospitalCRUD.entity.Ward;
import com.hospitalCRUD.entity.Prescription;
import com.hospitalCRUD.entity.Nurse;
import com.hospitalCRUD.dtos.AdmissionDTO;
import com.hospitalCRUD.repository.AdmissionRepository;
import com.hospitalCRUD.repository.BedRepository;
import com.hospitalCRUD.repository.PatientRepository;
import com.hospitalCRUD.repository.DoctorRepository;
import com.hospitalCRUD.repository.DepartmentRepository;
import com.hospitalCRUD.repository.WardRepository;
import com.hospitalCRUD.repository.NurseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdmissionService {

    private final AdmissionRepository admissionRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final BedRepository bedRepository;
    private final WardRepository wardRepository;
    private final NurseRepository nurseRepository;

    private static final List<String> ACTIVE_STATUSES = List.of("ADMITTED", "ACTIVE", "IN_PROGRESS");
    private static final List<String> REQUEST_STATUSES = List.of("PENDING", "ADMITTED", "ACTIVE", "IN_PROGRESS");

    public List<Admission> getAll() {
        return admissionRepository.findAll();
    }

    public Admission getById(Long id) {
        return admissionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Admission not found"));
    }

    @Transactional(readOnly = true)
    public List<AdmissionDTO> getAllDtos() {
        return admissionRepository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public AdmissionDTO getDtoById(Long id) {
        return toDto(getById(id));
    }

    @Transactional
    public AdmissionDTO create(AdmissionDTO request) {
        return create(request, null);
    }

    @Transactional
    public AdmissionDTO create(AdmissionDTO request, String nurseEmail) {
        Admission admission = fromDto(request);
        if (StringUtils.hasText(nurseEmail)) {
            Nurse admittingNurse = nurseRepository.findByUser_EmailIgnoreCase(nurseEmail.trim())
                    .orElseThrow(() -> new IllegalStateException("Your nurse profile is not linked"));
            if (admission.getWard() == null || admission.getWard().getId() == null
                    || admittingNurse.getWardRef() == null
                    || !admission.getWard().getId().equals(admittingNurse.getWardRef().getId())) {
                throw new IllegalStateException("You can admit patients only to the ward assigned to your nurse profile");
            }
            admission.setAssignedNurse(admittingNurse);
        }
        return toDto(create(admission));
    }

    @Transactional
    public Admission createPendingFromPrescription(Prescription prescription) {
        if (prescription == null || prescription.getId() == null || prescription.getPatient() == null) {
            throw new IllegalArgumentException("A saved prescription and patient are required for an admission request");
        }
        if (!StringUtils.hasText(prescription.getAdmissionReason())) {
            throw new IllegalArgumentException("An admission reason is required");
        }
        if (admissionRepository.existsBySourcePrescription_Id(prescription.getId())) return null;
        if (admissionRepository.existsByPatient_IdAndStatusIn(prescription.getPatient().getId(), REQUEST_STATUSES)) {
            throw new IllegalStateException("The patient already has a pending request or active admission");
        }

        Admission request = new Admission();
        request.setAdmissionId("ADM-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase());
        request.setPatient(prescription.getPatient());
        request.setDoctor(prescription.getDoctor());
        request.setDepartment(prescription.getDepartment());
        request.setSourcePrescription(prescription);
        request.setReason(prescription.getAdmissionReason().trim());
        request.setAdmissionDate(LocalDate.now());
        request.setStatus("PENDING");
        return admissionRepository.save(request);
    }

    @Transactional
    public AdmissionDTO update(Long id, AdmissionDTO request) {
        return toDto(update(id, fromDto(request)));
    }

    @Transactional
    public Admission create(Admission admission) {
        validateAdmission(admission);
        admission.setPatient(requirePatient(admission.getPatient()));
        admission.setDoctor(requireDoctor(admission.getDoctor()));
        admission.setDepartment(resolveDepartment(admission.getDepartment(), admission.getDoctor()));

        if (!StringUtils.hasText(admission.getAdmissionId())) {
            admission.setAdmissionId("ADM-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase());
        }
        if (!StringUtils.hasText(admission.getStatus())) {
            admission.setStatus("ADMITTED");
        }
        admission.setStatus(admission.getStatus().trim().toUpperCase());
        if (isActive(admission.getStatus())
                && admissionRepository.existsByPatient_IdAndStatusIn(
                        admission.getPatient().getId(), ACTIVE_STATUSES)) {
            throw new IllegalStateException("This patient already has an active admission");
        }
        admission.setBed(resolveAndReserveBed(admission.getBed(), admission.getWard(), null));
        if (isActive(admission.getStatus()) && admission.getBed() == null) {
            throw new IllegalArgumentException("An available bed or cabin must be assigned before admission");
        }
        if ("PENDING".equals(admission.getStatus()) && admission.getBed() != null) {
            throw new IllegalArgumentException("A bed cannot be reserved before the admission request is confirmed");
        }
        if (admission.getBed() != null && admission.getWard() == null) {
            admission.setWard(admission.getBed().getWard());
        }
        if (isActive(admission.getStatus())) {
            admission.setAssignedNurse(selectNurseForWard(admission.getWard(), admission.getAssignedNurse()));
        }
        return admissionRepository.save(admission);
    }

    @Transactional
    public Admission update(Long id, Admission admission) {

        Admission existing = getById(id);

        if (StringUtils.hasText(admission.getAdmissionId())) existing.setAdmissionId(admission.getAdmissionId());
        Patient updatedPatient = requirePatient(admission.getPatient());
        Doctor updatedDoctor = requireDoctor(admission.getDoctor());
        if (isActive(admission.getStatus())
                && (!existing.getPatient().getId().equals(updatedPatient.getId()) || !isActive(existing.getStatus()))
                && admissionRepository.existsByPatient_IdAndStatusIn(updatedPatient.getId(), ACTIVE_STATUSES)) {
            throw new IllegalStateException("This patient already has an active admission");
        }
        existing.setPatient(updatedPatient);
        existing.setDoctor(updatedDoctor);
        existing.setDepartment(resolveDepartment(admission.getDepartment(), updatedDoctor));
        Bed oldBed = existing.getBed();
        boolean wasPending = "PENDING".equalsIgnoreCase(existing.getStatus());
        String requestedStatus = StringUtils.hasText(admission.getStatus())
                ? admission.getStatus().trim().toUpperCase() : existing.getStatus();
        Bed requestedBed = resolveAndReserveBed(admission.getBed(), admission.getWard(), oldBed);
        if (oldBed != null && (requestedBed == null || !oldBed.getId().equals(requestedBed.getId()))) {
            oldBed.setStatus("AVAILABLE");
            bedRepository.save(oldBed);
        }
        existing.setBed(requestedBed);
        existing.setWard(requestedBed == null ? admission.getWard() : requestedBed.getWard());
        existing.setAdmissionDate(admission.getAdmissionDate());
        existing.setDischargeDate(admission.getDischargeDate());
        existing.setReason(admission.getReason());
        existing.setStatus(StringUtils.hasText(admission.getStatus())
                ? requestedStatus : existing.getStatus());

        if ("PENDING".equals(existing.getStatus()) && requestedBed != null) {
            throw new IllegalArgumentException("A bed cannot be reserved before the admission request is confirmed");
        }

        if (isActive(existing.getStatus())) {
            if (requestedBed == null) throw new IllegalArgumentException("An available bed or cabin must be assigned before admission");
            if (existing.getAdmissionDate() == null || wasPending) {
                existing.setAdmissionDate(LocalDate.now());
            }
            existing.setAssignedNurse(selectNurseForWard(existing.getWard(), existing.getAssignedNurse()));
        }

        if (!isActive(existing.getStatus()) && requestedBed != null) {
            requestedBed.setStatus("AVAILABLE");
            bedRepository.save(requestedBed);
        }

        return admissionRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        Admission admission = getById(id);
        if (admission.getBed() != null) {
            admission.getBed().setStatus("AVAILABLE");
            bedRepository.save(admission.getBed());
        }
        admissionRepository.delete(admission);
    }

    @Transactional
    public AdmissionDTO discharge(Long id, LocalDate dischargeDate) {
        Admission admission = getById(id);
        if (!isActive(admission.getStatus())) throw new IllegalStateException("Only an admitted patient can be discharged");
        admission.setStatus("DISCHARGED");
        admission.setDischargeDate(dischargeDate == null ? LocalDate.now() : dischargeDate);
        if (admission.getBed() != null) {
            admission.getBed().setStatus("AVAILABLE");
            bedRepository.save(admission.getBed());
        }
        return toDto(admissionRepository.save(admission));
    }

    private void validateAdmission(Admission admission) {
        if (admission == null || admission.getPatient() == null || admission.getPatient().getId() == null) {
            throw new IllegalArgumentException("A patient must be selected for admission");
        }
        if (admission.getAdmissionDate() == null) {
            admission.setAdmissionDate(LocalDate.now());
        }
    }

    private Patient requirePatient(Patient patient) {
        if (patient == null || patient.getId() == null) {
            throw new IllegalArgumentException("A valid patient must be selected");
        }
        return patientRepository.findById(patient.getId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
    }

    private Doctor requireDoctor(Doctor doctor) {
        if (doctor == null || doctor.getId() == null) return null;
        return doctorRepository.findById(doctor.getId())
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
    }

    private Department resolveDepartment(Department department, Doctor doctor) {
        if (department != null && department.getId() != null) {
            return departmentRepository.findById(department.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        }
        return doctor == null ? null : doctor.getDepartment();
    }

    private Bed resolveAndReserveBed(Bed bed, com.hospitalCRUD.entity.Ward ward, Bed currentBed) {
        if (bed == null || bed.getId() == null) return null;
        Bed persisted = bedRepository.findLockedById(bed.getId())
                .orElseThrow(() -> new IllegalArgumentException("Bed not found"));
        if (ward != null && ward.getId() != null && !ward.getId().equals(persisted.getWard().getId())) {
            throw new IllegalArgumentException("The selected bed does not belong to the selected ward");
        }
        boolean sameBed = currentBed != null && currentBed.getId().equals(persisted.getId());
        if (!sameBed && !"AVAILABLE".equalsIgnoreCase(persisted.getStatus())) {
            throw new IllegalStateException("The selected bed is not available");
        }
        if (!sameBed && admissionRepository.existsByBed_IdAndStatusIn(persisted.getId(), ACTIVE_STATUSES)) {
            throw new IllegalStateException("The selected bed is already assigned to an admitted patient");
        }
        persisted.setStatus("OCCUPIED");
        return bedRepository.save(persisted);
    }

    private boolean isActive(String status) {
        return status != null && ACTIVE_STATUSES.contains(status.trim().toUpperCase());
    }

    private Nurse selectNurseForWard(Ward ward, Nurse current) {
        if (ward == null || ward.getId() == null) {
            throw new IllegalArgumentException("A ward is required to assign a nurse");
        }
        if (current != null && current.getWardRef() != null
                && ward.getId().equals(current.getWardRef().getId())
                && (current.getStatus() == null || "ACTIVE".equalsIgnoreCase(current.getStatus()))) {
            return current;
        }
        List<Nurse> candidates = nurseRepository.findByWardRef_Id(ward.getId()).stream()
                .filter(nurse -> nurse.getStatus() == null || "ACTIVE".equalsIgnoreCase(nurse.getStatus()))
                .toList();
        if (candidates.isEmpty()) {
            throw new IllegalStateException("No active nurse is assigned to the selected ward. Assign a nurse to this ward before confirming admission.");
        }
        return candidates.stream()
                .min(java.util.Comparator.comparingLong(nurse -> admissionRepository
                        .countByAssignedNurse_IdAndStatusIn(nurse.getId(), ACTIVE_STATUSES)))
                .orElseThrow();
    }

    private Admission fromDto(AdmissionDTO dto) {
        if (dto == null) throw new IllegalArgumentException("Admission information is required");
        Admission admission = new Admission();
        admission.setAdmissionId(dto.getAdmissionId());
        admission.setPatient(resolvePatient(dto.getPatientId(), dto.getPatientName()));
        admission.setDoctor(resolveDoctor(dto.getDoctorId(), dto.getDoctor()));
        admission.setDepartment(resolveDepartment(dto.getDepartmentId(), dto.getDepartment()));
        admission.setWard(resolveWard(dto.getWardId(), dto.getWard()));
        admission.setBed(resolveBed(dto.getBedId(), dto.getBed()));
        admission.setAdmissionDate(dto.getAdmissionDate());
        admission.setDischargeDate(dto.getDischargeDate());
        admission.setReason(dto.getReason());
        admission.setStatus(dto.getStatus());
        return admission;
    }

    private Patient resolvePatient(Long id, String name) {
        if (id != null) return patientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        if (StringUtils.hasText(name)) return patientRepository.findFirstByNameIgnoreCase(name.trim())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        return null;
    }

    private Doctor resolveDoctor(Long id, String name) {
        if (id != null) return doctorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        if (StringUtils.hasText(name)) return doctorRepository.findFirstByNameIgnoreCase(name.trim())
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        return null;
    }

    private Department resolveDepartment(Long id, String name) {
        if (id != null) return departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        if (StringUtils.hasText(name)) return departmentRepository.findFirstByDepartmentNameIgnoreCase(name.trim())
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        return null;
    }

    private Ward resolveWard(Long id, String name) {
        if (id != null) return wardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ward not found"));
        if (StringUtils.hasText(name)) return wardRepository.findFirstByWardNameIgnoreCase(name.trim())
                .orElseThrow(() -> new IllegalArgumentException("Ward not found"));
        return null;
    }

    private Bed resolveBed(Long id, String number) {
        if (id != null) return bedRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Bed not found"));
        if (StringUtils.hasText(number)) return bedRepository.findFirstByBedNumberIgnoreCase(number.trim())
                .orElseThrow(() -> new IllegalArgumentException("Bed not found"));
        return null;
    }

    private AdmissionDTO toDto(Admission admission) {
        AdmissionDTO dto = new AdmissionDTO();
        dto.setId(admission.getId());
        dto.setAdmissionId(admission.getAdmissionId());
        if (admission.getPatient() != null) {
            dto.setPatientId(admission.getPatient().getId());
            dto.setPatientName(admission.getPatient().getName());
        }
        if (admission.getDoctor() != null) {
            dto.setDoctorId(admission.getDoctor().getId());
            dto.setDoctor(admission.getDoctor().getName());
        }
        if (admission.getDepartment() != null) {
            dto.setDepartmentId(admission.getDepartment().getId());
            dto.setDepartment(admission.getDepartment().getDepartmentName());
        }
        if (admission.getWard() != null) {
            dto.setWardId(admission.getWard().getId());
            dto.setWard(admission.getWard().getWardName());
        }
        if (admission.getBed() != null) {
            dto.setBedId(admission.getBed().getId());
            dto.setBed(admission.getBed().getBedNumber());
            dto.setBedType(admission.getBed().getBedType());
        }
        if (admission.getAssignedNurse() != null) {
            dto.setAssignedNurseId(admission.getAssignedNurse().getId());
            dto.setAssignedNurseName(admission.getAssignedNurse().getName());
        }
        dto.setAdmissionDate(admission.getAdmissionDate());
        dto.setDischargeDate(admission.getDischargeDate());
        dto.setReason(admission.getReason());
        dto.setStatus(admission.getStatus());
        if (admission.getPatient() != null) {
            dto.setPatientCode(admission.getPatient().getPatientId());
            dto.setPatientPhone(admission.getPatient().getPhone());
            dto.setPatientAge(admission.getPatient().getAge());
            dto.setPatientGender(admission.getPatient().getGender());
        }
        dto.setSourcePrescriptionId(admission.getSourcePrescription() == null ? null : admission.getSourcePrescription().getId());
        return dto;
    }
}
