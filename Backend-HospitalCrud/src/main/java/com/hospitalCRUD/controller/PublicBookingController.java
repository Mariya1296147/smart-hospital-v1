package com.hospitalCRUD.controller;

import com.hospitalCRUD.dtos.PublicDepartmentOption;
import com.hospitalCRUD.dtos.PublicDoctorOption;
import com.hospitalCRUD.repository.DepartmentRepository;
import com.hospitalCRUD.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicBookingController {

    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;

    @GetMapping("/departments")
    public List<PublicDepartmentOption> getDepartments() {
        return departmentRepository.findAll().stream()
                .map(department -> new PublicDepartmentOption(
                        department.getId(), department.getDepartmentName(), department.getDescription()))
                .toList();
    }

    @GetMapping("/doctors")
    public List<PublicDoctorOption> getDoctors() {
        return doctorRepository.findAll().stream()
                .filter(doctor -> doctor.getStatus() != null
                        && ("ACTIVE".equalsIgnoreCase(doctor.getStatus())
                        || "AVAILABLE".equalsIgnoreCase(doctor.getStatus())))
                .map(doctor -> new PublicDoctorOption(
                        doctor.getId(),
                        doctor.getName(),
                        doctor.getSpecialization(),
                        doctor.getQualification(),
                        doctor.getExperience(),
                        doctor.getImageUrl(),
                        doctor.getDepartment() == null ? null : doctor.getDepartment().getId(),
                        doctor.getDepartment() == null ? null : doctor.getDepartment().getDepartmentName()))
                .toList();
    }
}
