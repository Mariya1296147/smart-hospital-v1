package com.hospitalCRUD.service;

import com.hospitalCRUD.entity.Laboratory;
import com.hospitalCRUD.repository.LaboratoryRepository;
import com.hospitalCRUD.repository.PatientRepository;
import com.hospitalCRUD.repository.DoctorRepository;
import com.hospitalCRUD.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LaboratoryService {

    private final LaboratoryRepository laboratoryRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;

    public List<Laboratory> getAll() {
        return laboratoryRepository.findAll();
    }

    public Laboratory getById(Long id) {
        return laboratoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Laboratory not found"));
    }

    public Laboratory create(Laboratory laboratory) {
        linkReferences(laboratory);
        return laboratoryRepository.save(laboratory);
    }

    public Laboratory update(Long id, Laboratory laboratory) {
        Laboratory existing = getById(id);

        existing.setTestId(laboratory.getTestId());
        existing.setPatient(laboratory.getPatient());
        existing.setTestName(laboratory.getTestName());
        existing.setDepartment(laboratory.getDepartment());
        existing.setDoctor(laboratory.getDoctor());
        existing.setSampleDate(laboratory.getSampleDate());
        existing.setResult(laboratory.getResult());
        existing.setStatus(laboratory.getStatus());

        linkReferences(existing);
        return laboratoryRepository.save(existing);
    }

    public void delete(Long id) {
        laboratoryRepository.deleteById(id);
    }

    private void linkReferences(Laboratory laboratory) {
        if (laboratory.getPatient() == null || laboratory.getPatient().getId() == null) {
            throw new IllegalArgumentException("A valid patient must be selected");
        }
        laboratory.setPatient(patientRepository.findById(laboratory.getPatient().getId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found")));
        if (laboratory.getDoctor() != null && laboratory.getDoctor().getId() != null) {
            laboratory.setDoctor(doctorRepository.findById(laboratory.getDoctor().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Doctor not found")));
        }
        if (laboratory.getDepartment() != null && laboratory.getDepartment().getId() != null) {
            laboratory.setDepartment(departmentRepository.findById(laboratory.getDepartment().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found")));
        } else if (laboratory.getDoctor() != null) {
            laboratory.setDepartment(laboratory.getDoctor().getDepartment());
        }
    }
}
