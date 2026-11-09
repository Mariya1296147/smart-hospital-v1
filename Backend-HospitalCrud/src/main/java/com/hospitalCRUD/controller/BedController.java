package com.hospitalCRUD.controller;

import com.hospitalCRUD.entity.Bed;
import com.hospitalCRUD.service.BedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/beds")
@RequiredArgsConstructor
public class BedController {
    private final BedService bedService;

    @GetMapping @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTS_STAFF','RECEPTIONIST','NURSE')") public List<Bed> getAll() { return bedService.getAll(); }
    @GetMapping("/available") @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTS_STAFF','RECEPTIONIST','NURSE')")
    public List<Bed> getAvailable(@RequestParam(required = false) Long wardId) { return bedService.getAvailable(wardId); }
    @GetMapping("/{id}") @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTS_STAFF','RECEPTIONIST','NURSE')") public Bed getById(@PathVariable Long id) { return bedService.getById(id); }
    @PostMapping @PreAuthorize("hasRole('ADMIN')") @ResponseStatus(HttpStatus.CREATED) public Bed create(@RequestBody Bed bed) { return bedService.create(bed); }
    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public Bed update(@PathVariable Long id, @RequestBody Bed bed) { return bedService.update(id, bed); }
    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id) { bedService.delete(id); }
}
