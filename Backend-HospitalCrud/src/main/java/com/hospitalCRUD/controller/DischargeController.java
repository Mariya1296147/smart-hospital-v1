package com.hospitalCRUD.controller;

import com.hospitalCRUD.entity.Discharge;
import com.hospitalCRUD.service.DischargeService;
import com.hospitalCRUD.service.RecordAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/discharges")
@RequiredArgsConstructor
public class DischargeController {

    private final DischargeService dischargeService;
    private final RecordAccessService recordAccessService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR','NURSE','PATIENT')")
    public List<Discharge> getAll(Authentication authentication) {
        return dischargeService.getAll().stream().filter(item -> recordAccessService.canRead(item, authentication)).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR','NURSE','PATIENT')")
    public Discharge getById(@PathVariable Long id, Authentication authentication) {
        Discharge item = dischargeService.getById(id);
        recordAccessService.requireRead(recordAccessService.canRead(item, authentication));
        return item;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public Discharge create(@RequestBody Discharge discharge) {
        return dischargeService.create(discharge);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public Discharge update(
            @PathVariable Long id,
            @RequestBody Discharge discharge
    ) {
        return dischargeService.update(id, discharge);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String delete(@PathVariable Long id) {
        dischargeService.delete(id);
        return "Discharge deleted successfully";
    }
}
