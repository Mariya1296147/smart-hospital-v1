package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository
        extends JpaRepository<Department, Long> {
    java.util.Optional<Department> findFirstByDepartmentNameIgnoreCase(String departmentName);
}
