package com.hospitalCRUD.service;

import com.hospitalCRUD.entity.Doctor;
import com.hospitalCRUD.entity.Nurse;
import com.hospitalCRUD.entity.User;
import com.hospitalCRUD.entity.UserRole;
import com.hospitalCRUD.repository.DoctorRepository;
import com.hospitalCRUD.repository.NurseRepository;
import com.hospitalCRUD.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Backfills the new staff-to-account links when a matching role account exists. */
@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class StaffAccountLinkInitializer implements CommandLineRunner {

    private final DoctorRepository doctorRepository;
    private final NurseRepository nurseRepository;
    private final UserRepository userRepository;
    private final com.hospitalCRUD.repository.PatientRepository patientRepository;

    public StaffAccountLinkInitializer(DoctorRepository doctorRepository,
                                       NurseRepository nurseRepository,
                                       UserRepository userRepository,
                                       com.hospitalCRUD.repository.PatientRepository patientRepository) {
        this.doctorRepository = doctorRepository;
        this.nurseRepository = nurseRepository;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        for (Doctor doctor : doctorRepository.findAll()) {
            if (doctor.getUser() == null && doctor.getEmail() != null) {
                userRepository.findByEmailIgnoreCase(doctor.getEmail().trim())
                        .filter(user -> hasRole(user, UserRole.DOCTOR))
                        .filter(user -> doctorRepository.findByUser_UserName(user.getUserName()).isEmpty())
                        .ifPresent(doctor::setUser);
            }
        }
        for (Nurse nurse : nurseRepository.findAll()) {
            if (nurse.getUser() == null && nurse.getEmail() != null) {
                userRepository.findByEmailIgnoreCase(nurse.getEmail().trim())
                        .filter(user -> hasRole(user, UserRole.NURSE))
                        .filter(user -> nurseRepository.findByUser_UserName(user.getUserName()).isEmpty())
                        .ifPresent(nurse::setUser);
            }
        }
        for (com.hospitalCRUD.entity.Patient patient : patientRepository.findAll()) {
            if (patient.getUser() == null && patient.getEmail() != null) {
                userRepository.findByEmailIgnoreCase(patient.getEmail().trim())
                        .filter(user -> hasRole(user, UserRole.PATIENT))
                        .filter(user -> patientRepository.findByUser_UserName(user.getUserName()).isEmpty())
                        .ifPresent(patient::setUser);
            }
        }
    }

    private boolean hasRole(User user, UserRole role) {
        return user.getRoles() != null && user.getRoles().contains(role);
    }
}
