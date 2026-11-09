package com.hospitalCRUD.service;

import com.hospitalCRUD.dtos.NursingNoteDTO;
import com.hospitalCRUD.dtos.NursingNoteRequest;
import com.hospitalCRUD.dtos.VitalSignDTO;
import com.hospitalCRUD.dtos.VitalSignRequest;
import com.hospitalCRUD.entity.Nurse;
import com.hospitalCRUD.entity.NursingNote;
import com.hospitalCRUD.entity.Patient;
import com.hospitalCRUD.entity.VitalSign;
import com.hospitalCRUD.repository.AdmissionRepository;
import com.hospitalCRUD.repository.NurseRepository;
import com.hospitalCRUD.repository.NursingNoteRepository;
import com.hospitalCRUD.repository.PatientRepository;
import com.hospitalCRUD.repository.VitalSignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NurseCareService {
    private static final List<String> ACTIVE = List.of("ADMITTED", "ACTIVE", "IN_PROGRESS");

    private final NurseRepository nurseRepository;
    private final PatientRepository patientRepository;
    private final AdmissionRepository admissionRepository;
    private final VitalSignRepository vitalSignRepository;
    private final NursingNoteRepository nursingNoteRepository;

    @Transactional(readOnly = true)
    public List<VitalSignDTO> getVitalSigns(String email) {
        Nurse nurse = requireNurse(email);
        return vitalSignRepository.findByNurse_IdOrderByRecordedAtDesc(nurse.getId()).stream()
                .map(this::toDto).toList();
    }

    public VitalSignDTO addVitalSigns(String email, VitalSignRequest request) {
        Nurse nurse = requireNurse(email);
        Patient patient = requireWardPatient(nurse, request == null ? null : request.patientId());
        validateVitalSigns(request);
        VitalSign vital = new VitalSign();
        vital.setNurse(nurse);
        vital.setPatient(patient);
        vital.setTemperatureC(request.temperatureC());
        vital.setPulseBpm(request.pulseBpm());
        vital.setRespiratoryRate(request.respiratoryRate());
        vital.setSystolicBp(request.systolicBp());
        vital.setDiastolicBp(request.diastolicBp());
        vital.setOxygenSaturation(request.oxygenSaturation());
        vital.setRecordedAt(LocalDateTime.now());
        return toDto(vitalSignRepository.save(vital));
    }

    @Transactional(readOnly = true)
    public List<NursingNoteDTO> getNursingNotes(String email) {
        Nurse nurse = requireNurse(email);
        return nursingNoteRepository.findByNurse_IdOrderByRecordedAtDesc(nurse.getId()).stream()
                .map(this::toDto).toList();
    }

    public NursingNoteDTO addNursingNote(String email, NursingNoteRequest request) {
        Nurse nurse = requireNurse(email);
        if (request == null || request.note() == null || request.note().isBlank() || request.note().trim().length() > 4000) {
            throw new IllegalArgumentException("A nursing note of 1 to 4000 characters is required");
        }
        Patient patient = requireWardPatient(nurse, request.patientId());
        NursingNote note = new NursingNote();
        note.setNurse(nurse);
        note.setPatient(patient);
        note.setNote(request.note().trim());
        note.setRecordedAt(LocalDateTime.now());
        return toDto(nursingNoteRepository.save(note));
    }

    private Nurse requireNurse(String email) {
        return nurseRepository.findByUser_EmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalStateException("Your nurse profile is not linked. Ask an administrator to assign your profile and ward."));
    }

    private Patient requireWardPatient(Nurse nurse, Long patientId) {
        if (patientId == null) throw new IllegalArgumentException("Select a patient");
        if (nurse.getWardRef() == null || nurse.getWardRef().getId() == null) {
            throw new IllegalStateException("Your nurse profile is not assigned to a ward");
        }
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        if (!admissionRepository.existsByPatient_IdAndWard_IdAndStatusIn(patientId, nurse.getWardRef().getId(), ACTIVE)) {
            throw new AccessDeniedException("You can record care only for actively admitted patients in your assigned ward");
        }
        return patient;
    }

    private void validateVitalSigns(VitalSignRequest request) {
        if (request == null || request.patientId() == null) throw new IllegalArgumentException("Select a patient");
        if (request.temperatureC() == null && request.pulseBpm() == null && request.respiratoryRate() == null
                && request.systolicBp() == null && request.diastolicBp() == null && request.oxygenSaturation() == null) {
            throw new IllegalArgumentException("Enter at least one vital sign");
        }
        if (request.temperatureC() != null && (request.temperatureC().doubleValue() < 25 || request.temperatureC().doubleValue() > 45)) throw new IllegalArgumentException("Temperature must be between 25 and 45 °C");
        if (request.pulseBpm() != null && (request.pulseBpm() < 20 || request.pulseBpm() > 250)) throw new IllegalArgumentException("Pulse must be between 20 and 250 bpm");
        if (request.respiratoryRate() != null && (request.respiratoryRate() < 4 || request.respiratoryRate() > 80)) throw new IllegalArgumentException("Respiratory rate must be between 4 and 80 per minute");
        if (request.oxygenSaturation() != null && (request.oxygenSaturation() < 50 || request.oxygenSaturation() > 100)) throw new IllegalArgumentException("Oxygen saturation must be between 50 and 100 percent");
        if ((request.systolicBp() == null) != (request.diastolicBp() == null)) throw new IllegalArgumentException("Enter both systolic and diastolic blood pressure");
        if (request.systolicBp() != null && (request.systolicBp() < 40 || request.systolicBp() > 300
                || request.diastolicBp() < 20 || request.diastolicBp() > 200)) throw new IllegalArgumentException("Blood pressure values are outside the accepted range");
    }

    private VitalSignDTO toDto(VitalSign item) {
        return new VitalSignDTO(item.getId(), item.getPatient().getId(), item.getPatient().getName(),
                item.getPatient().getPatientId(), item.getTemperatureC(), item.getPulseBpm(),
                item.getRespiratoryRate(), item.getSystolicBp(), item.getDiastolicBp(),
                item.getOxygenSaturation(), item.getRecordedAt());
    }

    private NursingNoteDTO toDto(NursingNote item) {
        return new NursingNoteDTO(item.getId(), item.getPatient().getId(), item.getPatient().getName(),
                item.getPatient().getPatientId(), item.getNote(), item.getRecordedAt());
    }
}
