package com.hospitalCRUD.controller;

import com.hospitalCRUD.entity.Ward;
import com.hospitalCRUD.service.WardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/wards")
@RequiredArgsConstructor
public class WardController {
    private final WardService wardService;

    @GetMapping @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTS_STAFF','RECEPTIONIST','NURSE')") public List<Ward> getAll() { return wardService.getAll(); }
    @GetMapping("/available") @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTS_STAFF','RECEPTIONIST','NURSE')")
    public List<Ward> getAvailable() { return wardService.getAvailable(); }
    @GetMapping("/{id}") @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTS_STAFF','RECEPTIONIST','NURSE')") public Ward getById(@PathVariable Long id) { return wardService.getById(id); }
    @PostMapping @PreAuthorize("hasRole('ADMIN')") @ResponseStatus(HttpStatus.CREATED) public Ward create(@RequestBody Ward ward) { return wardService.create(ward); }
    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public Ward update(@PathVariable Long id, @RequestBody Ward ward) { return wardService.update(id, ward); }
    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id) { wardService.delete(id); }
}
