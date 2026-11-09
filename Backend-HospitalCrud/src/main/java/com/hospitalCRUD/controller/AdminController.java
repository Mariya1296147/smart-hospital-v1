
package com.hospitalCRUD.controller;

import com.hospitalCRUD.entity.UserRole;
import com.hospitalCRUD.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get all hospital roles
    @GetMapping("/roles")
    public ResponseEntity<List<UserRole>> getAllRoles() {
        return ResponseEntity.ok(
                Arrays.asList(UserRole.values())
        );
    }

    // Get total user statistics
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getSystemStatistics() {

        long totalUsers = userRepository.count();

        long enabledUsers = userRepository.findAll()
                .stream()
                .filter(user -> Boolean.TRUE.equals(user.getEnabled()))
                .count();

        Map<String, Object> stats = new HashMap<>();

        stats.put("totalUsers", totalUsers);
        stats.put("enabledUsers", enabledUsers);
        stats.put("roles", Arrays.asList(UserRole.values()));

        return ResponseEntity.ok(stats);
    }
}
