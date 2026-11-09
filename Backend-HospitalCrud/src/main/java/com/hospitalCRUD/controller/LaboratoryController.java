package com.hospitalCRUD.controller;

import com.hospitalCRUD.entity.Laboratory;
import com.hospitalCRUD.dtos.LaboratoryWorkItemDTO;
import com.hospitalCRUD.dtos.LaboratoryWorkflowUpdateRequest;
import com.hospitalCRUD.service.LaboratoryService;
import com.hospitalCRUD.service.LaboratoryWorkflowService;
import com.hospitalCRUD.service.RecordAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/laboratories")
@RequiredArgsConstructor
public class LaboratoryController {

    private final LaboratoryService laboratoryService;
    private final LaboratoryWorkflowService laboratoryWorkflowService;
    private final RecordAccessService recordAccessService;

    @GetMapping("/worklist")
    @PreAuthorize("hasRole('LABORATORY_STAFF')")
    public List<LaboratoryWorkItemDTO> getWorklist(@RequestParam(required = false) String status) {
        return laboratoryWorkflowService.getWorklist(status);
    }

    @GetMapping("/reports")
    @PreAuthorize("hasAnyRole('LABORATORY_STAFF','DOCTOR')")
    public List<LaboratoryWorkItemDTO> getCompletedReports(Authentication authentication) {
        boolean doctor = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_DOCTOR".equals(authority.getAuthority()));
        return doctor
                ? laboratoryWorkflowService.getCompletedReportsForDoctor(authentication.getName())
                : laboratoryWorkflowService.getWorklist("COMPLETED");
    }

    @PatchMapping("/worklist/{testId}")
    @PreAuthorize("hasRole('LABORATORY_STAFF')")
    public LaboratoryWorkItemDTO updatePaidTest(
            @PathVariable Long testId,
            @RequestBody LaboratoryWorkflowUpdateRequest request
    ) {
        return laboratoryWorkflowService.update(testId, request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','PATIENT')")
    public List<Laboratory> getAll(Authentication authentication) {
        return laboratoryService.getAll().stream().filter(item -> recordAccessService.canRead(item, authentication)).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','PATIENT')")
    public Laboratory getById(@PathVariable Long id, Authentication authentication) {
        Laboratory item = laboratoryService.getById(id);
        recordAccessService.requireRead(recordAccessService.canRead(item, authentication));
        return item;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public Laboratory create(@RequestBody Laboratory laboratory) {
        return laboratoryService.create(laboratory);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Laboratory update(
            @PathVariable Long id,
            @RequestBody Laboratory laboratory
    ) {
        return laboratoryService.update(id, laboratory);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String delete(@PathVariable Long id) {
        laboratoryService.delete(id);
        return "Laboratory deleted successfully";
    }
}
