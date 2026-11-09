package com.hospitalCRUD.service;

import com.hospitalCRUD.entity.Ward;
import com.hospitalCRUD.repository.DepartmentRepository;
import com.hospitalCRUD.repository.BedRepository;
import com.hospitalCRUD.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WardService {
    private final WardRepository wardRepository;
    private final DepartmentRepository departmentRepository;
    private final BedRepository bedRepository;

    public List<Ward> getAll() { return wardRepository.findAll(); }

    public List<Ward> getAvailable() { return wardRepository.findWithAvailableBeds(); }

    public Ward getById(Long id) {
        return wardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ward not found"));
    }

    public Ward create(Ward ward) {
        linkDepartment(ward);
        validate(ward);
        return wardRepository.save(ward);
    }

    public Ward update(Long id, Ward request) {
        Ward ward = getById(id);
        linkDepartment(request);
        validate(request);
        if (request.getCapacity() != null && bedRepository.countByWard_Id(id) > request.getCapacity()) {
            throw new IllegalStateException("Ward capacity cannot be lower than the number of beds already assigned");
        }
        ward.setWardName(request.getWardName().trim());
        ward.setWardNumber(request.getWardNumber());
        ward.setWardType(request.getWardType());
        ward.setCapacity(request.getCapacity());
        ward.setDepartment(request.getDepartment());
        return wardRepository.save(ward);
    }

    public void delete(Long id) {
        getById(id);
        if (bedRepository.existsByWard_Id(id)) {
            throw new IllegalStateException("A ward with beds assigned cannot be deleted");
        }
        wardRepository.deleteById(id);
    }

    private void linkDepartment(Ward ward) {
        if (ward.getDepartment() != null && ward.getDepartment().getId() != null) {
            ward.setDepartment(departmentRepository.findById(ward.getDepartment().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found")));
        }
    }

    private void validate(Ward ward) {
        if (ward.getWardName() == null || ward.getWardName().isBlank()) {
            throw new IllegalArgumentException("Ward name is required");
        }
        if (ward.getCapacity() != null && ward.getCapacity() < 0) {
            throw new IllegalArgumentException("Ward capacity cannot be negative");
        }
    }
}
