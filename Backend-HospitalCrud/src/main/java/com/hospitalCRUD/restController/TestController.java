package com.hospitalCRUD.restController;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE', 'LABORATORY_STAFF', 'PHARMACY_STAFF', 'ACCOUNTS_STAFF')")
    public Map<String, String> allAccess() {
        return Map.of("message", "Hospital API access successful.");
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> adminAccess() {
        return Map.of("message", "Admin access successful.");
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    public Map<String, String> doctorAccess() {
        return Map.of("message", "Doctor access successful.");
    }

    @GetMapping("/reception")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public Map<String, String> receptionAccess() {
        return Map.of("message", "Receptionist access successful.");
    }
}
