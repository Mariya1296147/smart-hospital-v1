package com.hospitalCRUD.service;

import com.hospitalCRUD.entity.*;
import com.hospitalCRUD.dtos.AdmissionDTO;
import com.hospitalCRUD.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecordAccessService {
    private final AppointmentRepository appointments;
    private final AdmissionRepository admissions;
    private final LaboratoryRepository laboratories;
    private final NurseRepository nurses;
    private final PatientRepository patients;
    private final DoctorRepository doctors;

    public boolean canRead(AdmissionDTO row, Authentication auth) {
        if (has(auth, UserRole.ADMIN, UserRole.ACCOUNTS_STAFF, UserRole.RECEPTIONIST)) return true;
        Patient patient = row.getPatientId() == null ? null : patients.findById(row.getPatientId()).orElse(null);
        if (patient == null) return false;
        if (has(auth, UserRole.PATIENT) && same(patient.getEmail(), email(auth))) return true;
        Doctor doctor = row.getDoctorId() == null ? null : doctors.findById(row.getDoctorId()).orElse(null);
        if (has(auth, UserRole.DOCTOR) && doctor != null && same(doctor.getEmail(), email(auth))) return true;
        if (has(auth, UserRole.NURSE) && row.getWardId() != null) {
            return nurses.findByUser_EmailIgnoreCase(email(auth))
                    .map(n -> n.getWardRef() != null && n.getWardRef().getId().equals(row.getWardId()))
                    .orElse(false);
        }
        return false;
    }

    public boolean canReadPatient(Patient patient, Authentication auth) {
        if (has(auth, UserRole.ADMIN, UserRole.ACCOUNTS_STAFF, UserRole.RECEPTIONIST)) return true;
        String email = email(auth);
        if (has(auth, UserRole.PATIENT)) return same(patient.getEmail(), email);
        if (has(auth, UserRole.DOCTOR)) {
            return appointments.existsByDoctor_EmailIgnoreCaseAndPatient_IdAndStatus(
                    email,
                    patient.getId(),
                    AppointmentStatus.SCHEDULED
            );

        }
        if (has(auth, UserRole.NURSE)) return nurses.findByUser_EmailIgnoreCase(email)
                .map(nurse -> nurse.getWardRef() != null && nurse.getWardRef().getId() != null
                        && admissions.existsByPatient_IdAndWard_IdAndStatusIn(patient.getId(), nurse.getWardRef().getId(),
                                java.util.List.of("ADMITTED", "ACTIVE", "IN_PROGRESS")))
                .orElse(false);
        return has(auth, UserRole.LABORATORY_STAFF) && laboratories.existsByPatient_Id(patient.getId());
    }

    public boolean canRead(Appointment row, Authentication auth) {
        return has(auth, UserRole.ADMIN, UserRole.RECEPTIONIST)
                || has(auth, UserRole.DOCTOR) && same(row.getDoctor().getEmail(), email(auth))
                || has(auth, UserRole.PATIENT) && same(row.getPatient().getEmail(), email(auth));
    }

    public boolean canRead(Admission row, Authentication auth) {
        if (has(auth, UserRole.ADMIN, UserRole.RECEPTIONIST)) return true;
        if (has(auth, UserRole.DOCTOR) && row.getDoctor() != null
                && same(row.getDoctor().getEmail(), email(auth))) return true;
        if (has(auth, UserRole.PATIENT) && same(row.getPatient().getEmail(), email(auth))) return true;
        return has(auth, UserRole.NURSE) && row.getWard() != null
                && nurses.findByUser_EmailIgnoreCase(email(auth))
                    .map(n -> n.getWardRef() != null && n.getWardRef().getId().equals(row.getWard().getId()))
                    .orElse(false);
    }

    public boolean canRead(Billing row, Authentication auth) {
        return has(auth, UserRole.ADMIN, UserRole.ACCOUNTS_STAFF, UserRole.RECEPTIONIST)
                || has(auth, UserRole.PATIENT) && same(row.getPatient().getEmail(), email(auth));
    }

    public boolean canRead(Consultation row, Authentication auth) {
        return has(auth, UserRole.ADMIN)
                || has(auth, UserRole.DOCTOR) && row.getDoctor() != null && same(row.getDoctor().getEmail(), email(auth))
                || has(auth, UserRole.PATIENT) && same(row.getPatient().getEmail(), email(auth))
                || has(auth, UserRole.NURSE) && canReadPatient(row.getPatient(), auth);
    }

    public boolean canRead(Prescription row, Authentication auth) {
        return has(auth, UserRole.ADMIN, UserRole.PHARMACY_STAFF)
                || has(auth, UserRole.DOCTOR) && same(row.getDoctor().getEmail(), email(auth))
                || has(auth, UserRole.PATIENT) && same(row.getPatient().getEmail(), email(auth))
                || has(auth, UserRole.NURSE) && canReadPatient(row.getPatient(), auth);
    }

    public boolean canRead(Laboratory row, Authentication auth) {
        return has(auth, UserRole.ADMIN, UserRole.LABORATORY_STAFF)
                || has(auth, UserRole.DOCTOR) && row.getDoctor() != null && same(row.getDoctor().getEmail(), email(auth))
                || has(auth, UserRole.PATIENT) && same(row.getPatient().getEmail(), email(auth))
                || has(auth, UserRole.NURSE) && canReadPatient(row.getPatient(), auth);
    }

    public boolean canRead(Discharge row, Authentication auth) {
        if (has(auth, UserRole.ADMIN, UserRole.RECEPTIONIST)) return true;
        if (has(auth, UserRole.DOCTOR) && row.getDoctor() != null
                && same(row.getDoctor().getEmail(), email(auth))) return true;
        if (has(auth, UserRole.PATIENT) && same(row.getPatient().getEmail(), email(auth))) return true;
        return has(auth, UserRole.NURSE) && assignedToNurse(row.getPatient(), email(auth));
    }

    public boolean canRead(Patient patient, String email) {
        return same(patient.getEmail(), email);
    }

    public void requireRead(boolean allowed) {
        if (!allowed) throw new AccessDeniedException("You do not have access to this record");
    }

    private boolean assignedToNurse(Patient patient, String email) {
        return nurses.findByUser_EmailIgnoreCase(email)
                .map(nurse -> nurse.getId() != null
                        && admissions.existsByPatient_IdAndAssignedNurse_IdAndStatusIn(patient.getId(), nurse.getId(),
                                java.util.List.of("ADMITTED", "ACTIVE", "IN_PROGRESS")))
                .orElse(false);
    }

    private boolean has(Authentication auth, UserRole... roles) {
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(authority -> {
                    for (UserRole role : roles) {
                        if (("ROLE_" + role.name()).equals(authority.getAuthority())) return true;
                    }
                    return false;
                });
    }

    private String email(Authentication auth) { return auth == null ? "" : auth.getName(); }
    private boolean same(String first, String second) {
        return first != null && second != null && first.equalsIgnoreCase(second);
    }
}
