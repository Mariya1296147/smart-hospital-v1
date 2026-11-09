package com.hospitalCRUD.restController;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/test2")
public class TestController2 {

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE', 'LABORATORY_STAFF', 'PHARMACY_STAFF', 'ACCOUNTS_STAFF')")
    public Map<String, String> allAccess() {
        return Map.of("message", "Hospital user content.");
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    public Map<String, String> doctorAccess() {
        return Map.of("message", "Doctor board.");
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> adminAccess() {
        return Map.of("message", "Admin board.");
    }
}
