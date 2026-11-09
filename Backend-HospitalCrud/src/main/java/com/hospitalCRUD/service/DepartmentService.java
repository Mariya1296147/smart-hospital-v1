package com.hospitalCRUD.service;

import com.hospitalCRUD.entity.Department;
import com.hospitalCRUD.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Department not found"));
    }

    public Department createDepartment(Department department) {
        return departmentRepository.save(department);
    }

    public Department updateDepartment(Long id, Department department) {

        Department existingDepartment = getDepartmentById(id);

        existingDepartment.setDepartmentName(
                department.getDepartmentName());

        existingDepartment.setDepartmentCode(
                department.getDepartmentCode());

        existingDepartment.setDescription(
                department.getDescription());

        return departmentRepository.save(existingDepartment);
    }

    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }
}
