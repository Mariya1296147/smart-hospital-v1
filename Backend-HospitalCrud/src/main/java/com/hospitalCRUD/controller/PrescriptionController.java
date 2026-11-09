
package com.hospitalCRUD.controller;

import com.hospitalCRUD.dtos.PrescriptionDTO;
import com.hospitalCRUD.dtos.CompletedDoctorVisitDTO;
import com.hospitalCRUD.entity.Prescription;
import com.hospitalCRUD.reports.PrescriptionReportService;
import com.hospitalCRUD.service.PrescriptionService;
import com.hospitalCRUD.service.RecordAccessService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final RecordAccessService recordAccessService;
    private final PrescriptionReportService prescriptionReportService;

    @GetMapping("/doctor-visits")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public List<CompletedDoctorVisitDTO> getCompletedDoctorVisits() {
        return prescriptionService.getCompletedDoctorVisits();
    }

    // Get all prescriptions accessible to the logged-in user
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PHARMACY_STAFF','PATIENT','NURSE')")
    public List<PrescriptionDTO> getAll(Authentication authentication) {

        return prescriptionService.getAllEntities()
                .stream()
                .filter(prescription ->
                        recordAccessService.canRead(prescription, authentication)
                )
                .map(prescription ->
                        prescriptionService.getById(prescription.getId())
                )
                .toList();
    }

    // Get prescription by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PHARMACY_STAFF','PATIENT','NURSE')")
    public PrescriptionDTO getById(
            @PathVariable Long id,
            Authentication authentication
    ) {

        Prescription prescription =
                prescriptionService.getEntityById(id);

        recordAccessService.requireRead(
                recordAccessService.canRead(prescription, authentication)
        );

        return prescriptionService.getById(id);
    }

    @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PHARMACY_STAFF','PATIENT','NURSE')")
    public ResponseEntity<byte[]> getPrescriptionPdf(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Prescription prescription = prescriptionService.getEntityById(id);
        recordAccessService.requireRead(recordAccessService.canRead(prescription, authentication));
        byte[] pdf = prescriptionReportService.generatePrescriptionPdf(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=prescription-" + id + ".pdf")
                .body(pdf);
    }

    // Create a new prescription
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public PrescriptionDTO create(
            @RequestBody PrescriptionDTO prescription,
            Authentication authentication
    ) {
        return prescriptionService.create(prescription, authentication);
    }

    // Update an existing prescription
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public PrescriptionDTO update(
            @PathVariable Long id,
            @RequestBody PrescriptionDTO prescription
    ) {
        return prescriptionService.update(id, prescription);
    }

    // Delete prescription
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String delete(@PathVariable Long id) {

        prescriptionService.delete(id);

        return "Prescription deleted successfully";
    }
}
