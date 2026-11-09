
package com.hospitalCRUD.service;

import com.hospitalCRUD.dtos.*;
import com.hospitalCRUD.entity.User;
import com.hospitalCRUD.entity.UserRole;
import com.hospitalCRUD.entity.UserStatus;
import com.hospitalCRUD.repository.UserRepository;
import com.hospitalCRUD.repository.PatientRepository;
import com.hospitalCRUD.secqurity.JwtUtil;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.util.EnumSet;
import java.util.Locale;

@Service
@Transactional
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorService doctorService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtUtil jwtUtil,
            UserRepository userRepository,
            PatientRepository patientRepository,
            DoctorService doctorService,
            PasswordEncoder passwordEncoder) {

        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorService = doctorService;
        this.passwordEncoder = passwordEncoder;
    }

    // Login
    public JwtResponse login(LoginRequest loginRequest) {

        String normalizedEmail = loginRequest.getEmail().trim().toLowerCase(Locale.ROOT);
        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                normalizedEmail,
                                loginRequest.getPassword()
                        )
                );

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);

        String email = normalizedEmail;
        String jwt = jwtUtil.generateToken(email);

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(
                        () -> new RuntimeException("User not found")
                );

        UserDTO userDTO = new UserDTO();

        userDTO.setUserName(user.getUserName());
        userDTO.setUserFirstName(user.getUserFirstName());
        userDTO.setUserLastName(user.getUserLastName());
        userDTO.setEmail(user.getEmail());
        userDTO.setEnabled(user.getEnabled());
        userDTO.setRoles(user.getRoles());


        if (user.getDateCreated() != null) {
            userDTO.setDateCreated(user.getDateCreated());
        }



        return new JwtResponse(jwt, userDTO);
    }

    // Register
    public String register(RegisterRequest registerRequest) {

        validateRegistration(registerRequest);

        User user = createUserFromRequest(registerRequest);

        userRepository.save(user);

        return "User registered successfully";
    }

    public String registerByAdmin(AdminRegisterRequest request) {

        if (userRepository.existsByUserNameIgnoreCase(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();

        user.setUserName(request.getUsername());
        user.setUserFirstName(request.getFirstName());
        user.setUserLastName(request.getLastName());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setEnabled(true);
        user.setAccountNonExpired(true);
        user.setCredentialsNonExpired(true);
        user.setAccountNonLocked(true);
        user.setStatus(UserStatus.ACTIVE);

        user.setRoles(EnumSet.copyOf(request.getRoles()));

        User savedUser = userRepository.save(user);
        if (savedUser.getRoles().contains(UserRole.DOCTOR)) {
            doctorService.ensureProfileForAccount(savedUser);
        }
        if (savedUser.getRoles().contains(UserRole.PATIENT)) {
            patientRepository.findByEmailIgnoreCase(email)
                    .filter(patient -> patient.getUser() == null)
                    .filter(patient -> patientRepository.findByUser_UserName(savedUser.getUserName()).isEmpty())
                    .ifPresent(patient -> {
                        patient.setUser(savedUser);
                        patientRepository.save(patient);
                    });
        }

        return "User registered successfully";
    }
    // Validate Registration
    private void validateRegistration(RegisterRequest registerRequest) {

        if (userRepository.existsByUserNameIgnoreCase(
                registerRequest.getUsername())) {

            throw new IllegalArgumentException(
                    "Username already exists"
            );
        }

        if (userRepository.existsByEmailIgnoreCase(
                registerRequest.getEmail().trim())) {

            throw new IllegalArgumentException(
                    "Email already exists"
            );
        }
    }

    // Create User
    private User createUserFromRequest(
            RegisterRequest registerRequest) {

        User user = new User();

        user.setUserName(registerRequest.getUsername());
        user.setPassword(
                passwordEncoder.encode(registerRequest.getPassword())
        );
        user.setEmail(registerRequest.getEmail().trim().toLowerCase(Locale.ROOT));
        user.setUserFirstName(registerRequest.getFirstName());
        user.setUserLastName(registerRequest.getLastName());

        user.setEnabled(true);
        user.setAccountNonExpired(true);
        user.setCredentialsNonExpired(true);
        user.setAccountNonLocked(true);
        user.setStatus(UserStatus.ACTIVE);

        // Default role
        user.setRoles(EnumSet.of(UserRole.RECEPTIONIST));

        return user;
    }
}
