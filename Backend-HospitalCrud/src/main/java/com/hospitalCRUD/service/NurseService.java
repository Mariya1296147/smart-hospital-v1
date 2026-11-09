package com.hospitalCRUD.service;

import com.hospitalCRUD.entity.Nurse;
import com.hospitalCRUD.dtos.NurseDTO;
import com.hospitalCRUD.entity.UserRole;
import com.hospitalCRUD.repository.NurseRepository;
import com.hospitalCRUD.repository.DepartmentRepository;
import com.hospitalCRUD.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class NurseService {

    private final NurseRepository nurseRepository;
    private final DepartmentRepository departmentRepository;
    private final WardRepository wardRepository;
    private final UserService userService;

    public List<Nurse> getAll() {
        return nurseRepository.findAll();
    }

    public Nurse getById(Long id) {
        return nurseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nurse not found"));
    }

    public Nurse getByUserEmail(String email) {
        return nurseRepository.findByUser_EmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("Nurse profile not found for this account"));
    }

    public NurseDTO toDto(Nurse nurse) {
        NurseDTO dto = new NurseDTO();
        dto.setId(nurse.getId());
        dto.setNurseId(nurse.getNurseId());
        dto.setName(nurse.getName());
        dto.setGender(nurse.getGender());
        dto.setPhone(nurse.getPhone());
        dto.setEmail(nurse.getEmail());
        dto.setDepartmentId(nurse.getDepartment() == null ? null : nurse.getDepartment().getId());
        dto.setDepartment(nurse.getDepartment() == null ? null : nurse.getDepartment().getDepartmentName());
        dto.setWard(nurse.getWardRef() == null ? nurse.getWard() : nurse.getWardRef().getWardName());
        dto.setShift(nurse.getShift());
        dto.setQualification(nurse.getQualification());
        dto.setJoiningDate(nurse.getJoiningDate());
        dto.setStatus(nurse.getStatus());
        return dto;
    }

    public Nurse create(Nurse nurse, String accountPassword) {
        if (nurse.getEmail() == null || nurse.getEmail().isBlank()) {
            throw new IllegalArgumentException("Nurse email is required to create the login account");
        }
        nurse.setEmail(nurse.getEmail().trim().toLowerCase(Locale.ROOT));
        linkReferences(nurse);
        nurse.setUser(userService.createStaffAccount(
                nurse.getEmail(), nurse.getName(), accountPassword,
                UserRole.NURSE, nurse.getStatus()));
        return nurseRepository.save(nurse);
    }

    /** Create a nurse from the API DTO, resolving departmentId to a persisted entity. */
    public Nurse create(NurseDTO profile, String accountPassword) {
        return create(fromDto(profile), accountPassword);
    }

    public Nurse update(Long id, Nurse nurse) {
        Nurse existing = getById(id);
        if (nurse.getEmail() == null || nurse.getEmail().isBlank()) {
            throw new IllegalArgumentException("Nurse email is required");
        }
        if (existing.getUser() == null) {
            existing.setUser(userService.findLinkedAccount(existing.getEmail(), UserRole.NURSE));
        }

        existing.setNurseId(nurse.getNurseId());
        existing.setName(nurse.getName());
        existing.setGender(nurse.getGender());
        existing.setPhone(nurse.getPhone());
        existing.setEmail(nurse.getEmail().trim().toLowerCase(Locale.ROOT));
        existing.setDepartment(nurse.getDepartment());
        existing.setWard(nurse.getWard());
        existing.setWardRef(nurse.getWardRef());
        existing.setShift(nurse.getShift());
        existing.setQualification(nurse.getQualification());
        existing.setJoiningDate(nurse.getJoiningDate());
        existing.setStatus(nurse.getStatus());

        linkReferences(existing);
        userService.syncStaffAccount(existing.getUser(), existing.getEmail(),
                existing.getName(), existing.getStatus(), UserRole.NURSE);
        return nurseRepository.save(existing);
    }

    /** Update a nurse from the API DTO, resolving departmentId to a persisted entity. */
    public Nurse update(Long id, NurseDTO profile) {
        return update(id, fromDto(profile));
    }

    private Nurse fromDto(NurseDTO profile) {
        Nurse nurse = new Nurse();
        nurse.setNurseId(profile.getNurseId());
        nurse.setName(profile.getName());
        nurse.setGender(profile.getGender());
        nurse.setPhone(profile.getPhone());
        nurse.setEmail(profile.getEmail());
        nurse.setWard(profile.getWard());
        nurse.setShift(profile.getShift());
        nurse.setQualification(profile.getQualification());
        nurse.setJoiningDate(profile.getJoiningDate());
        nurse.setStatus(profile.getStatus());
        if (profile.getDepartmentId() != null) {
            nurse.setDepartment(departmentRepository.findById(profile.getDepartmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found")));
        }
        return nurse;
    }

    public void delete(Long id) {
        Nurse nurse = getById(id);
        userService.disableStaffAccount(nurse.getUser(), UserRole.NURSE);
        nurseRepository.delete(nurse);
    }

    private void linkReferences(Nurse nurse) {
        if (nurse.getDepartment() != null && nurse.getDepartment().getId() != null) {
            nurse.setDepartment(departmentRepository.findById(nurse.getDepartment().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found")));
        }
        if (nurse.getWardRef() != null && nurse.getWardRef().getId() != null) {
            nurse.setWardRef(wardRepository.findById(nurse.getWardRef().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Ward not found")));
            nurse.setWard(nurse.getWardRef().getWardName());
        } else if (nurse.getWard() != null && !nurse.getWard().isBlank()) {
            wardRepository.findFirstByWardNameIgnoreCase(nurse.getWard().trim()).ifPresent(ward -> {
                nurse.setWardRef(ward);
                nurse.setWard(ward.getWardName());
            });
        }
        if (nurse.getWardRef() != null && nurse.getDepartment() == null) {
            nurse.setDepartment(nurse.getWardRef().getDepartment());
        }
    }
}
