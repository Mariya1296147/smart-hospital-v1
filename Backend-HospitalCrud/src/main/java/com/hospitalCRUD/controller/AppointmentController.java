package com.hospitalCRUD.controller;

import com.hospitalCRUD.dtos.AppointmentDTO;
import com.hospitalCRUD.dtos.PublicAppointmentRequest;
import com.hospitalCRUD.dtos.DoctorPatientDTO;
import com.hospitalCRUD.entity.Appointment;
import com.hospitalCRUD.entity.AppointmentStatus;
import com.hospitalCRUD.service.AppointmentService;
import com.hospitalCRUD.service.RecordAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final RecordAccessService recordAccessService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR','PATIENT')")
    public List<Appointment> getAll(Authentication authentication) {
        return appointmentService.getAll().stream()
                .filter(item -> recordAccessService.canRead(item, authentication)).toList();
    }
    @GetMapping("/doctor/my")
    public List<Appointment> getMyAppointments(
            @RequestParam(defaultValue = "SCHEDULED") AppointmentStatus status,
            Principal principal) {

        return appointmentService.getMyAppointments(
                principal.getName(),
                status
        );
    }

    @GetMapping("/doctor/patients")
    public List<DoctorPatientDTO> getMyPatients(Principal principal) {
        return appointmentService.getMyPatients(principal.getName());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR','PATIENT')")
    public Appointment getById(@PathVariable Long id, Authentication authentication) {
        Appointment appointment = appointmentService.getById(id);
        recordAccessService.requireRead(recordAccessService.canRead(appointment, authentication));
        return appointment;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public Appointment create(@RequestBody AppointmentDTO dto) {
        return appointmentService.create(dto);
    }
    @PostMapping("/public")
    public Appointment createPublic(
            @RequestBody PublicAppointmentRequest request) {
        return appointmentService.createPublic(request);
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public Appointment update(
            @PathVariable Long id,
            @RequestBody Appointment appointment
    ) {
        return appointmentService.update(id, appointment);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR')")
    public ResponseEntity<Appointment> updateStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status,
            Authentication authentication) {

        return ResponseEntity.ok(
                appointmentService.updateStatus(id, status, authentication)
        );
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public String delete(@PathVariable Long id) {
        appointmentService.delete(id);
        return "Appointment deleted successfully";
    }
}
