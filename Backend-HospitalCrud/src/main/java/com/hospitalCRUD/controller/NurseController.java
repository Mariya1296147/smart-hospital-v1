package com.hospitalCRUD.controller;

import com.hospitalCRUD.entity.Nurse;
import com.hospitalCRUD.dtos.NurseDTO;
import com.hospitalCRUD.dtos.StaffAccountCreateRequest;
import com.hospitalCRUD.service.NurseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/nurses")
@RequiredArgsConstructor
public class NurseController {

    private final NurseService nurseService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Nurse> getAll() {
        return nurseService.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','NURSE')")
    public Nurse getById(@PathVariable Long id, Authentication authentication) {
        Nurse nurse = nurseService.getById(id);
        boolean admin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        if (!admin && (nurse.getUser() == null || !nurse.getUser().getEmail().equalsIgnoreCase(authentication.getName()))) {
            throw new AccessDeniedException("You can only view your own nurse profile");
        }
        return nurse;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('NURSE')")
    public NurseDTO getMyProfile(Authentication authentication) {
        return nurseService.toDto(nurseService.getByUserEmail(authentication.getName()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Nurse create(@Valid @RequestBody StaffAccountCreateRequest<NurseDTO> request) {
        return nurseService.create(request.profile(), request.password());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Nurse update(
            @PathVariable Long id,
            @RequestBody NurseDTO nurse
    ) {
        return nurseService.update(id, nurse);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String delete(@PathVariable Long id) {
        nurseService.delete(id);
        return "Nurse deleted successfully";
    }

}
