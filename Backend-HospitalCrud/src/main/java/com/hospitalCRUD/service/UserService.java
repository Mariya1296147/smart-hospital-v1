
package com.hospitalCRUD.service;

import com.hospitalCRUD.entity.Doctor;
import com.hospitalCRUD.entity.Nurse;
import com.hospitalCRUD.entity.Patient;
import com.hospitalCRUD.entity.User;
import com.hospitalCRUD.entity.UserRole;
import com.hospitalCRUD.entity.UserStatus;
import com.hospitalCRUD.repository.UserRepository;
import com.hospitalCRUD.repository.DoctorRepository;
import com.hospitalCRUD.repository.NurseRepository;
import com.hospitalCRUD.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.EnumSet;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DoctorRepository doctorRepository;
    private final NurseRepository nurseRepository;
    private final PatientRepository patientRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(String userName) {
        return userRepository.findById(userName)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    @Transactional
    public User createStaffAccount(String email, String fullName, String rawPassword,
                                   UserRole role, String staffStatus) {
        String normalizedEmail = normalizeAndValidateEmail(email);
        User existing = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
        if (existing != null) {
            if (existing.getRoles() == null || !existing.getRoles().contains(role)) {
                throw new IllegalArgumentException("An account with this email already exists with a different role");
            }
            boolean alreadyLinked = role == UserRole.DOCTOR
                    ? doctorRepository.findByUser_UserName(existing.getUserName()).isPresent()
                    : role == UserRole.NURSE
                        ? nurseRepository.findByUser_UserName(existing.getUserName()).isPresent()
                        : role == UserRole.PATIENT
                            && patientRepository.findByUser_UserName(existing.getUserName()).isPresent();
            if (alreadyLinked) {
                throw new IllegalArgumentException("This account is already linked to a staff profile");
            }
            String[] name = splitName(fullName);
            existing.setUserFirstName(name[0]);
            existing.setUserLastName(name[1]);
            existing.setPassword(passwordEncoder.encode(rawPassword));
            existing.setAccountNonExpired(true);
            existing.setCredentialsNonExpired(true);
            existing.setAccountNonLocked(true);
            existing.setEmail(normalizedEmail);
            existing.setEnabled(isActive(staffStatus));
            existing.setStatus(isActive(staffStatus) ? UserStatus.ACTIVE : UserStatus.INACTIVE);
            return userRepository.save(existing);
        }

        String userName = normalizedEmail;
        while (userRepository.existsByUserNameIgnoreCase(userName)) {
            userName = normalizedEmail + "." + UUID.randomUUID().toString().substring(0, 8);
        }

        String[] name = splitName(fullName);
        User user = new User();
        user.setUserName(userName);
        user.setEmail(normalizedEmail);
        user.setUserFirstName(name[0]);
        user.setUserLastName(name[1]);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setEnabled(isActive(staffStatus));
        user.setAccountNonExpired(true);
        user.setCredentialsNonExpired(true);
        user.setAccountNonLocked(true);
        user.setStatus(isActive(staffStatus) ? UserStatus.ACTIVE : UserStatus.INACTIVE);
        user.setRoles(EnumSet.of(role));
        return userRepository.save(user);
    }

    @Transactional
    public void syncStaffAccount(User user, String email, String fullName, String staffStatus, UserRole role) {
        if (user == null) return; // Existing staff records may predate linked accounts.
        String normalizedEmail = normalizeAndValidateEmail(email);
        if (userRepository.existsByEmailIgnoreCaseAndUserNameNot(normalizedEmail, user.getUserName())) {
            throw new IllegalArgumentException("That email is already used by another account");
        }
        String[] name = splitName(fullName);
        user.setEmail(normalizedEmail);
        user.setUserFirstName(name[0]);
        user.setUserLastName(name[1]);
        boolean hasOtherRole = user.getRoles() != null
                && user.getRoles().stream().anyMatch(existingRole -> existingRole != role);
        boolean accountActive = isActive(staffStatus) || hasOtherRole;
        user.setEnabled(accountActive);
        user.setStatus(accountActive ? UserStatus.ACTIVE : UserStatus.INACTIVE);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User findLinkedAccount(String email, UserRole requiredRole) {
        if (email == null || email.isBlank()) return null;
        User user = userRepository.findByEmailIgnoreCase(email.trim())
                .filter(account -> account.getRoles() != null && account.getRoles().contains(requiredRole))
                .orElse(null);
        if (user == null) return null;
        boolean alreadyLinked = requiredRole == UserRole.DOCTOR
                ? doctorRepository.findByUser_UserName(user.getUserName()).isPresent()
                : requiredRole == UserRole.NURSE
                    ? nurseRepository.findByUser_UserName(user.getUserName()).isPresent()
                    : requiredRole == UserRole.PATIENT
                        && patientRepository.findByUser_UserName(user.getUserName()).isPresent();
        if (alreadyLinked) {
            throw new IllegalArgumentException("This account is already linked to a different staff profile");
        }
        return user;
    }

    @Transactional
    public void disableStaffAccount(User user, UserRole role) {
        if (user == null) return;
        if (user.getRoles() != null) user.getRoles().remove(role);
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            user.setEnabled(false);
            user.setStatus(UserStatus.INACTIVE);
        }
        userRepository.save(user);
    }

    @Transactional
    public void disableAccount(User user) {
        if (user == null) return;
        user.setEnabled(false);
        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
    }

    private String normalizeAndValidateEmail(String email) {
        String normalized = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        if (!normalized.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new IllegalArgumentException("A valid staff email is required for the login account");
        }
        return normalized;
    }

    private String[] splitName(String fullName) {
        String value = fullName == null ? "" : fullName.trim();
        if (value.isEmpty()) return new String[]{"Staff", ""};
        int separator = value.indexOf(' ');
        return separator < 0
                ? new String[]{value, ""}
                : new String[]{value.substring(0, separator), value.substring(separator + 1).trim()};
    }

    private boolean isActive(String status) {
        return status == null || status.isBlank() || "active".equalsIgnoreCase(status.trim());
    }

    @Transactional
    public User updateUser(String userName, User user) {

        User existingUser = getUserById(userName);
        String email = normalizeAndValidateEmail(user.getEmail());
        if (userRepository.existsByEmailIgnoreCaseAndUserNameNot(email, userName)) {
            throw new IllegalArgumentException("That email is already used by another account");
        }
        existingUser.setUserFirstName(user.getUserFirstName());
        existingUser.setUserLastName(user.getUserLastName());
        existingUser.setEmail(email);

        String fullName = (user.getUserFirstName() == null ? "" : user.getUserFirstName().trim())
                + " " + (user.getUserLastName() == null ? "" : user.getUserLastName().trim());
        doctorRepository.findByUser_UserName(userName).ifPresent(doctor -> {
            doctor.setEmail(email);
            doctor.setName(fullName.trim());
        });
        nurseRepository.findByUser_UserName(userName).ifPresent(nurse -> {
            nurse.setEmail(email);
            nurse.setName(fullName.trim());
        });
        patientRepository.findByUser_UserName(userName).ifPresent(patient -> {
            patient.setEmail(email);
            patient.setName(fullName.trim());
        });

        return userRepository.save(existingUser);
    }

    @Transactional
    public User updateEnabled(String userName, Boolean enabled) {
        if (enabled == null) throw new IllegalArgumentException("Enabled status is required");
        User user = getUserById(userName);
        if (enabled) {
            Doctor doctor = doctorRepository.findByUser_UserName(userName).orElse(null);
            Nurse nurse = nurseRepository.findByUser_UserName(userName).orElse(null);
            Patient patient = patientRepository.findByUser_UserName(userName).orElse(null);
            boolean hasStaffProfile = doctor != null || nurse != null || patient != null;
            boolean hasActiveStaffProfile = (doctor != null && isActive(doctor.getStatus()))
                    || (nurse != null && isActive(nurse.getStatus()))
                    || (patient != null && isActive(patient.getStatus()));
            if (hasStaffProfile && !hasActiveStaffProfile) {
                throw new IllegalArgumentException("An inactive staff profile cannot have its login enabled");
            }
        }
        user.setEnabled(enabled);
        user.setStatus(enabled ? UserStatus.ACTIVE : UserStatus.INACTIVE);
        return userRepository.save(user);
    }

    @Transactional
    public boolean deleteUser(String userName) {
        User user = getUserById(userName);
        boolean hasStaffProfile = doctorRepository.findByUser_UserName(userName).isPresent()
                || nurseRepository.findByUser_UserName(userName).isPresent()
                || patientRepository.findByUser_UserName(userName).isPresent();
        if (hasStaffProfile) {
            disableAccount(user);
        } else {
            userRepository.delete(user);
        }
        return hasStaffProfile;
    }



}
