package com.hospitalCRUD.controller;
import com.hospitalCRUD.entity.Admission;
import com.hospitalCRUD.dtos.AdmissionDTO;
import com.hospitalCRUD.service.AdmissionService;
import com.hospitalCRUD.service.RecordAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/admissions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdmissionController {

    private final AdmissionService admissionService;
    private final RecordAccessService recordAccessService;

    // Get all admissions
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTS_STAFF','RECEPTIONIST','DOCTOR','NURSE','PATIENT')")
    public ResponseEntity<List<AdmissionDTO>> getAll(Authentication authentication) {
        boolean nurse = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_NURSE".equals(authority.getAuthority()));
        return ResponseEntity.ok(
                admissionService.getAllDtos().stream()
                        .filter(item -> !nurse || List.of("ADMITTED", "ACTIVE", "IN_PROGRESS")
                                .contains(item.getStatus() == null ? "" : item.getStatus().trim().toUpperCase()))
                        .filter(item -> recordAccessService.canRead(item, authentication)).toList()
        );
    }

    // Get admission by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTS_STAFF','RECEPTIONIST','DOCTOR','NURSE','PATIENT')")
    public ResponseEntity<AdmissionDTO> getById(
            @PathVariable Long id, Authentication authentication) {

        AdmissionDTO item = admissionService.getDtoById(id);
        recordAccessService.requireRead(recordAccessService.canRead(item, authentication));
        return ResponseEntity.ok(item);
    }

    // Create admission
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTS_STAFF','RECEPTIONIST','NURSE')")
    public ResponseEntity<AdmissionDTO> create(
            @RequestBody AdmissionDTO admission, Authentication authentication) {

        AdmissionDTO savedAdmission =
                admissionService.create(admission, isNurse(authentication) ? authentication.getName() : null);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedAdmission);
    }

    private boolean isNurse(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_NURSE".equals(authority.getAuthority()));
    }

    // Update admission
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTS_STAFF','RECEPTIONIST')")
    public ResponseEntity<AdmissionDTO> update(
            @PathVariable Long id,
            @RequestBody AdmissionDTO admission) {

        return ResponseEntity.ok(
                admissionService.update(id, admission)
        );
    }

    @PatchMapping("/{id}/discharge")
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTS_STAFF','NURSE')")
    public ResponseEntity<AdmissionDTO> discharge(@PathVariable Long id) {
        return ResponseEntity.ok(admissionService.discharge(id, null));
    }

    // Delete admission
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        admissionService.delete(id);

        return ResponseEntity.noContent().build();
    }
}
