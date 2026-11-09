package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.TestCatalog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestCatalogRepository extends JpaRepository<TestCatalog, Long> {
    boolean existsByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);
    List<TestCatalog> findAllByOrderByNameAsc();
    List<TestCatalog> findByActiveTrueOrderByNameAsc();
}
