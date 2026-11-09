package com.hospitalCRUD.controller;

import com.hospitalCRUD.dtos.TestCatalogDTO;
import com.hospitalCRUD.service.TestCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test-catalog")
@RequiredArgsConstructor
public class TestCatalogController {
    private final TestCatalogService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public List<TestCatalogDTO> list(Authentication authentication) {
        return service.list(authentication);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public TestCatalogDTO create(@RequestBody TestCatalogDTO dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public TestCatalogDTO update(@PathVariable Long id, @RequestBody TestCatalogDTO dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
