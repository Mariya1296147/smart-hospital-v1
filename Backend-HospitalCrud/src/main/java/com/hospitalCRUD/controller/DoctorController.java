package com.hospitalCRUD.controller;

import com.hospitalCRUD.entity.Doctor;
import com.hospitalCRUD.dtos.StaffAccountCreateRequest;
import com.hospitalCRUD.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTS_STAFF','RECEPTIONIST','NURSE')")
    public List<Doctor> getAllDoctors() {
        return doctorService.getAllDoctors();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public Doctor getMyDoctor(Authentication authentication) {
        return doctorService.getDoctorByEmail(authentication.getName());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR')")
    public Doctor getDoctorById(@PathVariable Long id, Authentication authentication) {
        Doctor doctor = doctorService.getDoctorById(id);
        boolean admin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        if (!admin && (doctor.getEmail() == null || !doctor.getEmail().equalsIgnoreCase(authentication.getName()))) {
            throw new AccessDeniedException("You can only view your own doctor profile");
        }
        return doctor;
    }

    @PostMapping
    public Doctor createDoctor(@Valid @RequestBody StaffAccountCreateRequest<Doctor> request) {
        return doctorService.createDoctor(request.profile(), request.password());
    }

    @PutMapping("/{id}")
    public Doctor updateDoctor(
            @PathVariable Long id,
            @RequestBody Doctor doctor
    ) {
        return doctorService.updateDoctor(id, doctor);
    }

    @DeleteMapping("/{id}")
    public String deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return "Doctor deleted successfully";
    }
}
