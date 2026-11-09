package com.hospitalCRUD.service;

import com.hospitalCRUD.dtos.TestCatalogDTO;
import com.hospitalCRUD.entity.TestCatalog;
import com.hospitalCRUD.repository.PrescriptionTestRepository;
import com.hospitalCRUD.repository.TestCatalogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TestCatalogService {
    private final TestCatalogRepository catalog;
    private final PrescriptionTestRepository prescriptionTests;

    @Transactional(readOnly = true)
    public List<TestCatalogDTO> list(Authentication authentication) {
        boolean admin = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        List<TestCatalog> tests = admin ? catalog.findAllByOrderByNameAsc() : catalog.findByActiveTrueOrderByNameAsc();
        return tests.stream().map(this::toDTO).toList();
    }

    public TestCatalogDTO create(TestCatalogDTO dto) {
        validate(dto, null);
        TestCatalog test = new TestCatalog();
        apply(test, dto);
        return toDTO(catalog.save(test));
    }

    public TestCatalogDTO update(Long id, TestCatalogDTO dto) {
        TestCatalog test = catalog.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Test not found"));
        validate(dto, id);
        apply(test, dto);
        return toDTO(catalog.save(test));
    }

    public void delete(Long id) {
        TestCatalog test = catalog.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Test not found"));
        if (prescriptionTests.existsByCatalogTest_Id(id)) {
            test.setActive(false);
            catalog.save(test);
        } else {
            catalog.delete(test);
        }
    }

    private void validate(TestCatalogDTO dto, Long currentId) {
        if (dto.getCode() == null || dto.getCode().isBlank()) throw new IllegalArgumentException("Test code is required");
        if (dto.getName() == null || dto.getName().isBlank()) throw new IllegalArgumentException("Test name is required");
        if (dto.getPrice() == null || dto.getPrice().signum() < 0) throw new IllegalArgumentException("Price must be zero or greater");
        boolean duplicate = currentId == null ? catalog.existsByCodeIgnoreCase(dto.getCode().trim())
                : catalog.existsByCodeIgnoreCaseAndIdNot(dto.getCode().trim(), currentId);
        if (duplicate) throw new IllegalArgumentException("Test code is already in use");
    }

    private void apply(TestCatalog test, TestCatalogDTO dto) {
        test.setCode(dto.getCode().trim());
        test.setName(dto.getName().trim());
        test.setDescription(dto.getDescription() == null || dto.getDescription().isBlank() ? null : dto.getDescription().trim());
        test.setPrice(dto.getPrice());
        test.setActive(dto.isActive());
    }

    private TestCatalogDTO toDTO(TestCatalog test) {
        TestCatalogDTO dto = new TestCatalogDTO();
        dto.setId(test.getId());
        dto.setCode(test.getCode());
        dto.setName(test.getName());
        dto.setDescription(test.getDescription());
        dto.setPrice(test.getPrice());
        dto.setActive(test.isActive());
        return dto;
    }
}
