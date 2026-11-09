package com.hospitalCRUD.controller;

import com.hospitalCRUD.dtos.AdminRegisterRequest;
import com.hospitalCRUD.dtos.UserDTO;
import com.hospitalCRUD.entity.User;
import com.hospitalCRUD.repository.UserRepository;

import com.hospitalCRUD.service.AuthService;
import com.hospitalCRUD.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final UserService userService;


    public UserController(UserRepository userRepository, AuthService authService, UserService userService) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.userService = userService;
    }

    // GET ALL USERS - Only ADMIN
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();

        return ResponseEntity.ok(users);
    }

    // GET USER BY USERNAME
    @GetMapping("/{username}")
    @PreAuthorize("hasRole('ADMIN') or #username == authentication.name")
    public ResponseEntity<UserDTO> getUserByUsername(
            @PathVariable String username) {

        return userRepository.findByUserName(username)
                .map(this::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // UPDATE USER

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUserByAdmin(
            @Valid @RequestBody AdminRegisterRequest request) {

        String message = authService.registerByAdmin(request);

        return ResponseEntity.ok(message);
    }

    // UPDATE USER
    @PutMapping("/{username}")
    @PreAuthorize("hasRole('ADMIN') or #username == authentication.name")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable String username,
            @Valid @RequestBody UserDTO updateRequest) {

        if (!userRepository.existsByUserName(username)) return ResponseEntity.notFound().build();
        User update = new User();
        update.setUserFirstName(updateRequest.getUserFirstName());
        update.setUserLastName(updateRequest.getUserLastName());
        update.setEmail(updateRequest.getEmail());
        return ResponseEntity.ok(toDto(userService.updateUser(username, update)));
    }

    // DELETE USER - Only ADMIN
    @DeleteMapping("/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(
            @PathVariable String username) {

        if (!userRepository.existsById(username)) {
            return ResponseEntity.notFound().build();
        }

        boolean linkedToStaff = userService.deleteUser(username);
        return ResponseEntity.ok(linkedToStaff
                ? "Linked staff account disabled; staff profile retained"
                : "User deleted successfully");
    }

    // ENABLE/DISABLE USER - Only ADMIN
    @PatchMapping("/{username}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> updateUserStatus(
            @PathVariable String username,
            @RequestBody UserDTO statusRequest) {
        if (!userRepository.existsByUserName(username)) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(toDto(userService.updateEnabled(username, statusRequest.getEnabled())));
    }

    // CONVERT USER TO DTO
    private UserDTO toDto(User user) {
        UserDTO dto = new UserDTO();

        dto.setUserName(user.getUserName());
        dto.setUserFirstName(user.getUserFirstName());
        dto.setUserLastName(user.getUserLastName());
        dto.setEmail(user.getEmail());
        dto.setEnabled(user.getEnabled());
        dto.setRoles(user.getRoles());
        dto.setDateCreated(user.getDateCreated());

        return dto;
    }
}
