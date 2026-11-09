
package com.hospitalCRUD.service;

import com.hospitalCRUD.entity.Patient;
import com.hospitalCRUD.entity.UserRole;
import com.hospitalCRUD.repository.PatientRepository;
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
public class PatientService {

    private final PatientRepository patientRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final UserService userService;

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Patient not found"));
    }

    public Patient getPatientByEmail(String email) {
        return patientRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient profile not found for this account"));
    }

    // CREATE PATIENT
    public Patient createPatient(Patient patient) {

        validatePatientDetails(patient);

        if (patient.getEmail() == null
                || patient.getEmail().isBlank()) {
            throw new IllegalArgumentException(
                    "Patient email is required");
        }

        patient.setEmail(
                patient.getEmail().trim().toLowerCase(Locale.ROOT)
        );

        if (patient.getPatientId() == null
                || patient.getPatientId().isBlank()) {
            patient.setPatientId(
                    "PAT-" + UUID.randomUUID()
                            .toString()
                            .substring(0, 8)
                            .toUpperCase()
            );
        }

        linkDepartmentAndDoctor(patient);

        patient.setUser(
                userService.findLinkedAccount(
                        patient.getEmail(),
                        UserRole.PATIENT
                )
        );

        return patientRepository.save(patient);
    }

    // UPDATE PATIENT
    public Patient updatePatient(Long id, Patient patient) {

        validatePatientDetails(patient);

        Patient existingPatient = getPatientById(id);

        if (existingPatient.getUser() == null) {
            existingPatient.setUser(
                    userService.findLinkedAccount(
                            existingPatient.getEmail(),
                            UserRole.PATIENT
                    )
            );
        }

        existingPatient.setName(patient.getName());
        existingPatient.setFirstName(patient.getFirstName());
        existingPatient.setLastName(patient.getLastName());

        if (patient.getEmail() == null
                || patient.getEmail().isBlank()) {
            throw new IllegalArgumentException(
                    "Patient email is required");
        }

        existingPatient.setEmail(
                patient.getEmail().trim().toLowerCase(Locale.ROOT)
        );

        existingPatient.setPhone(patient.getPhone());
        existingPatient.setDateOfBirth(patient.getDateOfBirth());

        // AGE, GENDER
        existingPatient.setAge(patient.getAge());
        existingPatient.setGender(patient.getGender());

        existingPatient.setAddress(patient.getAddress());
        existingPatient.setBloodGroup(patient.getBloodGroup());
        existingPatient.setEmergencyContact(
                patient.getEmergencyContact()
        );
        existingPatient.setMaritalStatus(
                patient.getMaritalStatus()
        );

        // DEPARTMENT AND DOCTOR
        existingPatient.setDepartment(patient.getDepartment());
        existingPatient.setDoctor(patient.getDoctor());

        existingPatient.setDepartmentRef(patient.getDepartmentRef());
        existingPatient.setDoctorRef(patient.getDoctorRef());

        existingPatient.setAllergies(patient.getAllergies());
        existingPatient.setMedicalHistory(patient.getMedicalHistory());
        existingPatient.setStatus(patient.getStatus());

        linkDepartmentAndDoctor(existingPatient);

        userService.syncStaffAccount(
                existingPatient.getUser(),
                existingPatient.getEmail(),
                existingPatient.getName(),
                existingPatient.getStatus(),
                UserRole.PATIENT
        );

        return patientRepository.save(existingPatient);
    }

    // DELETE PATIENT
    public void deletePatient(Long id) {

        Patient patient = getPatientById(id);

        userService.disableStaffAccount(
                patient.getUser(),
                UserRole.PATIENT
        );

        patientRepository.delete(patient);
    }

    // VALIDATE REQUIRED PATIENT DETAILS
    private void validatePatientDetails(Patient patient) {

        if (patient.getAge() == null || patient.getAge() < 0) {
            throw new IllegalArgumentException(
                    "Patient age is required");
        }

        if (patient.getGender() == null
                || patient.getGender().isBlank()) {
            throw new IllegalArgumentException(
                    "Patient gender is required");
        }

        if (patient.getDepartment() == null
                || patient.getDepartment().isBlank()) {
            throw new IllegalArgumentException(
                    "Patient department is required");
        }

        patient.setGender(patient.getGender().trim());
        patient.setDepartment(patient.getDepartment().trim());
    }

    // LINK DEPARTMENT AND DOCTOR
    private void linkDepartmentAndDoctor(Patient patient) {

        // DEPARTMENT LINK
        if (patient.getDepartmentRef() != null
                && patient.getDepartmentRef().getId() != null) {

            patient.setDepartmentRef(
                    departmentRepository.findById(
                            patient.getDepartmentRef().getId()
                    ).orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Department not found"))
            );

            patient.setDepartment(
                    patient.getDepartmentRef().getDepartmentName()
            );

        } else if (patient.getDepartment() != null
                && !patient.getDepartment().isBlank()) {

            departmentRepository
                    .findFirstByDepartmentNameIgnoreCase(
                            patient.getDepartment().trim()
                    )
                    .ifPresent(department -> {
                        patient.setDepartmentRef(department);
                        patient.setDepartment(
                                department.getDepartmentName()
                        );
                    });
        }

        // DOCTOR LINK
        if (patient.getDoctorRef() != null
                && patient.getDoctorRef().getId() != null) {

            patient.setDoctorRef(
                    doctorRepository.findById(
                            patient.getDoctorRef().getId()
                    ).orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Doctor not found"))
            );

            patient.setDoctor(
                    patient.getDoctorRef().getName()
            );

        } else if (patient.getDoctor() != null
                && !patient.getDoctor().isBlank()) {

            doctorRepository.findFirstByNameIgnoreCase(
                    patient.getDoctor().trim()
            ).ifPresent(doctor -> {
                patient.setDoctorRef(doctor);
                patient.setDoctor(doctor.getName());
            });
        }

        // GET DEPARTMENT FROM DOCTOR IF NEEDED
        if (patient.getDoctorRef() != null
                && patient.getDepartmentRef() == null) {

            patient.setDepartmentRef(
                    patient.getDoctorRef().getDepartment()
            );

            if (patient.getDepartmentRef() != null) {
                patient.setDepartment(
                        patient.getDepartmentRef().getDepartmentName()
                );
            }
        }
    }
}
