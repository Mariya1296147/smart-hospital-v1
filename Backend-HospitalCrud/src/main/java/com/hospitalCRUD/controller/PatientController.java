package com.hospitalCRUD.controller;

import com.hospitalCRUD.entity.Patient;
import com.hospitalCRUD.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final com.hospitalCRUD.service.RecordAccessService recordAccessService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTS_STAFF','RECEPTIONIST','DOCTOR','NURSE','LABORATORY_STAFF','PATIENT')")
    public List<Patient> getAllPatients(Authentication authentication) {
        return patientService.getAllPatients().stream()
                .filter(patient -> recordAccessService.canReadPatient(patient, authentication))
                .toList();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public Patient getMyPatient(Authentication authentication) {
        return patientService.getPatientByEmail(authentication.getName());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR','NURSE','LABORATORY_STAFF','PATIENT')")
    public Patient getPatientById(@PathVariable Long id, Authentication authentication) {
        Patient patient = patientService.getPatientById(id);
        recordAccessService.requireRead(recordAccessService.canReadPatient(patient, authentication));
        return patient;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','NURSE')")
    public Patient createPatient(@RequestBody Patient patient) {
        return patientService.createPatient(patient);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','NURSE')")
    public Patient updatePatient(
            @PathVariable Long id,
            @RequestBody Patient patient
    ) {
        return patientService.updatePatient(id, patient);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return "Patient deleted successfully";
    }
}
