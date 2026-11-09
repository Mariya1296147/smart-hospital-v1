package com.hospitalCRUD.controller;

import com.hospitalCRUD.entity.Consultation;
import com.hospitalCRUD.service.ConsultationService;
import com.hospitalCRUD.service.RecordAccessService;
import com.hospitalCRUD.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;
    private final RecordAccessService recordAccessService;
    private final DoctorService doctorService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','PATIENT')")
    public List<Consultation> getAll(Authentication authentication) {
        return consultationService.getAll().stream().filter(item -> recordAccessService.canRead(item, authentication)).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','PATIENT')")
    public Consultation getById(@PathVariable Long id, Authentication authentication) {
        Consultation item = consultationService.getById(id);
        recordAccessService.requireRead(recordAccessService.canRead(item, authentication));
        return item;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST')")
    public Consultation create(@RequestBody Consultation consultation, Authentication authentication) {
        if (authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_DOCTOR".equals(authority.getAuthority()))) {
            consultation.setDoctor(doctorService.getDoctorByEmail(authentication.getName()));
            consultation.setDepartment(consultation.getDoctor().getDepartment());
        }
        return consultationService.create(consultation);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public Consultation update(
            @PathVariable Long id,
            @RequestBody Consultation consultation
    ) {
        return consultationService.update(id, consultation);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public String delete(@PathVariable Long id) {
        consultationService.delete(id);
        return "Consultation deleted successfully";
    }
}
