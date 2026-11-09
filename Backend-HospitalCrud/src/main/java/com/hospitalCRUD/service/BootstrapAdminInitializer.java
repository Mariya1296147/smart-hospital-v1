
        package com.hospitalCRUD.service;

import com.hospitalCRUD.entity.User;
import com.hospitalCRUD.entity.UserRole;
import com.hospitalCRUD.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.EnumSet;

@Component
public class BootstrapAdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public BootstrapAdminInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        createUser("admin", "admin@gmail.com",
                UserRole.ADMIN);

        createUser("doctor", "doctor@gmail.com",
                UserRole.DOCTOR);

        createUser("nurse", "nurse@gmail.com",
                UserRole.NURSE);

        createUser("lab", "lab@gmail.com",
                UserRole.LABORATORY_STAFF);

        createUser("pharmacy", "pharmacy@gmail.com",
                UserRole.PHARMACY_STAFF);

        createUser("accounts", "accounts@gmail.com",
                UserRole.ACCOUNTS_STAFF);

        createUser("receptionist", "receptionist@gmail.com",
                UserRole.RECEPTIONIST);
    }

    private void createUser(
            String username,
            String email,
            UserRole role) {

        if (userRepository.existsByUserName(username)
                || userRepository.existsByEmail(email)) {
            System.out.println(
                    "User already exists: " + username);
            return;
        }

        User user = new User();

        user.setUserName(username);
        user.setEmail(email);
        user.setPassword(
                passwordEncoder.encode(username + "12345"));

        user.setUserFirstName(username);
        user.setUserLastName("User");

        user.setEnabled(true);
        user.setAccountNonExpired(true);
        user.setCredentialsNonExpired(true);
        user.setAccountNonLocked(true);

        user.setRoles(EnumSet.of(role));

        userRepository.save(user);

        System.out.println(
                "Created user: " + username
                        + " | Role: " + role);
    }
}
