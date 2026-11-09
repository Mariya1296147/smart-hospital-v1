
package com.hospitalCRUD.service;

import com.hospitalCRUD.entity.Doctor;
import com.hospitalCRUD.entity.Department;
import com.hospitalCRUD.entity.User;
import com.hospitalCRUD.entity.UserRole;
import com.hospitalCRUD.repository.DepartmentRepository;
import com.hospitalCRUD.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final UserService userService;

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Doctor not found"));
    }

    public Doctor getDoctorByEmail(String email) {
        return doctorRepository.findFirstByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found for this account"));
    }

    /** Ensures an admin-created doctor login has exactly one visible doctor profile. */
    public Doctor ensureProfileForAccount(User user) {
        Doctor linkedProfile = doctorRepository.findByUser_UserName(user.getUserName()).orElse(null);
        if (linkedProfile != null) return linkedProfile;

        String email = user.getEmail().trim().toLowerCase(Locale.ROOT);
        Doctor existingProfile = doctorRepository.findFirstByEmailIgnoreCase(email).orElse(null);
        if (existingProfile != null) {
            if (existingProfile.getUser() != null
                    && !existingProfile.getUser().getUserName().equals(user.getUserName())) {
                throw new IllegalArgumentException("A doctor profile with this email is already linked to another account");
            }
            existingProfile.setUser(user);
            return doctorRepository.save(existingProfile);
        }

        Doctor profile = new Doctor();
        profile.setDoctorId(generateDoctorId());
        profile.setName((user.getUserFirstName() + " " + user.getUserLastName()).trim());
        profile.setEmail(email);
        profile.setStatus("ACTIVE");
        profile.setUser(user);
        return doctorRepository.save(profile);
    }

    public Doctor createDoctor(Doctor doctor, String accountPassword) {
        if (doctor.getEmail() == null || doctor.getEmail().isBlank()) {
            throw new IllegalArgumentException("Doctor email is required to create the login account");
        }
        doctor.setEmail(doctor.getEmail().trim().toLowerCase(Locale.ROOT));
        doctor.setDepartment(resolveDepartment(doctor.getDepartment()));

        // Generate doctorId automatically if it is missing
        if (doctor.getDoctorId() == null
                || doctor.getDoctorId().isBlank()) {

            doctor.setDoctorId(generateDoctorId());
        }

        doctor.setUser(userService.createStaffAccount(
                doctor.getEmail(), doctor.getName(), accountPassword,
                UserRole.DOCTOR, doctor.getStatus()));
        return doctorRepository.save(doctor);
    }

    private String generateDoctorId() {
        String doctorId;
        do {
            doctorId = "DOC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (doctorRepository.existsByDoctorId(doctorId));
        return doctorId;
    }

    public Doctor updateDoctor(Long id, Doctor doctor) {

        Doctor existingDoctor = getDoctorById(id);
        if (doctor.getEmail() == null || doctor.getEmail().isBlank()) {
            throw new IllegalArgumentException("Doctor email is required");
        }
        if (existingDoctor.getUser() == null) {
            existingDoctor.setUser(userService.findLinkedAccount(existingDoctor.getEmail(), UserRole.DOCTOR));
        }

        existingDoctor.setName(doctor.getName());
        existingDoctor.setEmail(doctor.getEmail().trim().toLowerCase(Locale.ROOT));
        existingDoctor.setPhone(doctor.getPhone());
        existingDoctor.setGender(doctor.getGender());
        existingDoctor.setSpecialization(doctor.getSpecialization());
        existingDoctor.setQualification(doctor.getQualification());
        existingDoctor.setExperience(doctor.getExperience());
        existingDoctor.setDepartment(resolveDepartment(doctor.getDepartment()));
        existingDoctor.setAvailableTime(doctor.getAvailableTime());
        existingDoctor.setJoiningDate(doctor.getJoiningDate());
        existingDoctor.setStatus(doctor.getStatus());
        existingDoctor.setImageUrl(doctor.getImageUrl());
        userService.syncStaffAccount(existingDoctor.getUser(), existingDoctor.getEmail(),
                existingDoctor.getName(), existingDoctor.getStatus(), UserRole.DOCTOR);

        return doctorRepository.save(existingDoctor);
    }

    private Department resolveDepartment(Department submittedDepartment) {
        if (submittedDepartment == null) return null;

        if (submittedDepartment.getId() != null) {
            return departmentRepository.findById(submittedDepartment.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Selected department was not found"));
        }

        String departmentName = submittedDepartment.getDepartmentName();
        if (departmentName == null || departmentName.isBlank()) return null;
        return departmentRepository.findFirstByDepartmentNameIgnoreCase(departmentName.trim())
                .orElseThrow(() -> new IllegalArgumentException("Selected department was not found: " + departmentName));
    }

    public void deleteDoctor(Long id) {
        Doctor doctor = getDoctorById(id);
        userService.disableStaffAccount(doctor.getUser(), UserRole.DOCTOR);
        doctorRepository.delete(doctor);
    }
}
