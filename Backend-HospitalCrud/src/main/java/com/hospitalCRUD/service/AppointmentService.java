
package com.hospitalCRUD.service;

import com.hospitalCRUD.dtos.AppointmentDTO;
import com.hospitalCRUD.dtos.PublicAppointmentRequest;
import com.hospitalCRUD.dtos.DoctorPatientDTO;
import com.hospitalCRUD.entity.Appointment;
import com.hospitalCRUD.entity.AppointmentStatus;
import com.hospitalCRUD.entity.Patient;
import com.hospitalCRUD.repository.AppointmentRepository;
import com.hospitalCRUD.repository.PatientRepository;
import com.hospitalCRUD.repository.DoctorRepository;
import com.hospitalCRUD.repository.DepartmentRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;
import java.time.LocalDate;
import java.time.Period;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private static final EnumSet<AppointmentStatus> BOOKING_STATUSES =
            EnumSet.of(AppointmentStatus.PENDING, AppointmentStatus.SCHEDULED);

    public List<Appointment> getAll() {
        return appointmentRepository.findAll();
    }
    public List<Appointment> getMyAppointments(String email, AppointmentStatus status) {
        return appointmentRepository
                .findByDoctor_EmailIgnoreCaseAndStatus(email, status);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<DoctorPatientDTO> getMyPatients(String email) {
        Map<Long, Appointment> latestAppointmentByPatient = new HashMap<>();
        for (Appointment appointment : appointmentRepository.findByDoctor_EmailIgnoreCase(email)) {
            if (appointment.getPatient() == null || appointment.getPatient().getId() == null) continue;
            Long patientKey = appointment.getPatient().getId();
            Appointment previous = latestAppointmentByPatient.get(patientKey);
            if (previous == null || isLater(appointment, previous)) {
                latestAppointmentByPatient.put(patientKey, appointment);
            }
        }

        return latestAppointmentByPatient.values().stream()
                .map(appointment -> {
                    Patient patient = appointment.getPatient();
                    Integer age = patient.getDateOfBirth() == null ? null
                            : Period.between(patient.getDateOfBirth(), LocalDate.now()).getYears();
                    var department = appointment.getDepartment() != null
                            ? appointment.getDepartment()
                            : appointment.getDoctor().getDepartment();
                    return new DoctorPatientDTO(
                            patient.getPatientId(), patient.getName(), age,
                            patient.getGender(), patient.getBloodGroup(), patient.getPhone(),
                            department == null ? null : department.getDepartmentName(),
                            appointment.getStatus() == null ? "PENDING" : appointment.getStatus().name(),
                            appointment.getAppointmentDate());
                })
                .sorted(Comparator.comparing(DoctorPatientDTO::lastAppointmentDate,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    private boolean isLater(Appointment candidate, Appointment current) {
        if (candidate.getAppointmentDate() == null) return false;
        return current.getAppointmentDate() == null
                || candidate.getAppointmentDate().isAfter(current.getAppointmentDate())
                || (candidate.getAppointmentDate().equals(current.getAppointmentDate())
                && candidate.getId() != null && current.getId() != null
                && candidate.getId() > current.getId());
    }

    public Appointment getById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Appointment not found"));
    }

    public Appointment create(AppointmentDTO dto) {

        Appointment appointment = new Appointment();

        Long patientId = dto.getPatientId() != null ? dto.getPatientId()
                : dto.getPatient() == null ? null : dto.getPatient().getId();
        Long doctorId = dto.getDoctorId() != null ? dto.getDoctorId()
                : dto.getDoctor() == null ? null : dto.getDoctor().getId();
        Long departmentId = dto.getDepartmentId() != null ? dto.getDepartmentId()
                : dto.getDepartment() == null ? null : dto.getDepartment().getId();

        appointment.setAppointmentId(dto.getAppointmentId());

        appointment.setPatient(
                patientRepository.findById(patientId)
                        .orElseThrow(() ->
                                new RuntimeException("Patient not found"))
        );

        var doctor = doctorRepository.findById(doctorId)
                        .orElseThrow(() ->
                                new RuntimeException("Doctor not found"));
        appointment.setDoctor(doctor);

        if (departmentId != null) {
            appointment.setDepartment(
                    departmentRepository.findById(departmentId)
                            .orElseThrow(() ->
                                    new RuntimeException("Department not found"))
            );
        }
        if (appointment.getDepartment() == null) {
            appointment.setDepartment(doctor.getDepartment());
        }

        appointment.setAppointmentDate(dto.getAppointmentDate());
        appointment.setAppointmentTime(dto.getAppointmentTime());
        appointment.setReason(dto.getReason());
        appointment.setAge(dto.getAge());
        appointment.setGender(dto.getGender());
        appointment.setStatus(dto.getStatus());
        appointment.setNotes(dto.getNotes());

        if (appointment.getStatus() == null) appointment.setStatus(AppointmentStatus.PENDING);
        ensureSlotAvailable(appointment, null);

        return appointmentRepository.save(appointment);
    }

    public Appointment update(Long id, Appointment appointment) {
        Appointment existing = getById(id);

        existing.setAppointmentId(appointment.getAppointmentId());
        existing.setPatient(requirePatient(appointment.getPatient()));
        var doctor = requireDoctor(appointment.getDoctor());
        existing.setDoctor(doctor);
        existing.setDepartment(resolveDepartment(appointment.getDepartment(), doctor));
        existing.setAppointmentDate(appointment.getAppointmentDate());
        existing.setAppointmentTime(appointment.getAppointmentTime());
        existing.setReason(appointment.getReason());
        existing.setAge(appointment.getAge());
        existing.setGender(appointment.getGender());
        existing.setStatus(appointment.getStatus());
        existing.setNotes(appointment.getNotes());

        if (existing.getStatus() == null) existing.setStatus(AppointmentStatus.PENDING);
        ensureSlotAvailable(existing, id);

        return appointmentRepository.save(existing);
    }

    private Patient requirePatient(Patient patient) {
        if (patient == null || patient.getId() == null) {
            throw new IllegalArgumentException("A valid patient must be selected");
        }
        return patientRepository.findById(patient.getId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
    }

    private com.hospitalCRUD.entity.Doctor requireDoctor(com.hospitalCRUD.entity.Doctor doctor) {
        if (doctor == null || doctor.getId() == null) {
            throw new IllegalArgumentException("A valid doctor must be selected");
        }
        return doctorRepository.findById(doctor.getId())
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
    }

    private com.hospitalCRUD.entity.Department resolveDepartment(
            com.hospitalCRUD.entity.Department department,
            com.hospitalCRUD.entity.Doctor doctor) {
        if (department == null || department.getId() == null) return doctor.getDepartment();
        return departmentRepository.findById(department.getId())
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
    }


    public Appointment updateStatus(Long id, AppointmentStatus status, Authentication authentication) {
        Appointment appointment = getById(id);

        boolean isDoctor = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_DOCTOR".equals(authority.getAuthority()));
        if (isDoctor && (appointment.getDoctor() == null
                || !appointment.getDoctor().getEmail().equalsIgnoreCase(authentication.getName()))) {
            throw new AccessDeniedException("Doctors can only update their own appointments");
        }

        if (isDoctor && appointment.getStatus() == AppointmentStatus.SCHEDULED
                && status == AppointmentStatus.COMPLETED) {
            appointment.setStatus(status);
            return appointmentRepository.save(appointment);
        }

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending appointments can be updated"
            );
        }

        if (status != AppointmentStatus.SCHEDULED
                && status != AppointmentStatus.REJECTED) {
            throw new IllegalArgumentException(
                    "Status must be SCHEDULED or REJECTED"
            );
        }

        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }



    public void delete(Long id) {
        appointmentRepository.deleteById(id);
    }

    @Transactional
    public Appointment createPublic(PublicAppointmentRequest request) {

        if (!StringUtils.hasText(request.getPatientName())
                || !StringUtils.hasText(request.getEmail())
                || !StringUtils.hasText(request.getPhone())
                || request.getAge() == null
                || request.getAge() < 0
                || !StringUtils.hasText(request.getGender())
                || request.getDoctorId() == null
                || request.getAppointmentDate() == null
                || request.getAppointmentTime() == null) {
            throw new IllegalArgumentException(
                    "Required appointment information is missing");
        }

        if (!request.getAppointmentDate().isAfter(
                java.time.LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Appointment date must be in the future");
        }

        String email = request.getEmail().trim();

        Patient patient = patientRepository
                .findByEmailIgnoreCase(email)
                .orElseGet(() -> {
                    Patient newPatient = new Patient();

                    newPatient.setPatientId(
                            "PAT-" + java.util.UUID.randomUUID()
                                    .toString().substring(0, 8)
                                    .toUpperCase());

                    newPatient.setName(request.getPatientName().trim());
                    newPatient.setEmail(email);
                    newPatient.setPhone(request.getPhone().trim());
                    newPatient.setStatus("ACTIVE");

                    return patientRepository.save(newPatient);
                });

        Appointment appointment = new Appointment();

        appointment.setAppointmentId(
                "APT-" + java.util.UUID.randomUUID()
                        .toString().substring(0, 8)
                        .toUpperCase());

        appointment.setPatient(patient);

        var doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        appointment.setDoctor(doctor);

        if (request.getDepartmentId() != null) {
            var department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found"));
            if (doctor.getDepartment() == null
                    || !doctor.getDepartment().getId().equals(department.getId())) {
                throw new IllegalArgumentException(
                        "The selected doctor does not belong to the selected department");
            }
            appointment.setDepartment(department);
        } else {
            appointment.setDepartment(doctor.getDepartment());
        }

        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setReason(request.getMessage());
        appointment.setAge(request.getAge());
        appointment.setGender(request.getGender().trim());
        appointment.setStatus(AppointmentStatus.PENDING);
        ensureSlotAvailable(appointment, null);

        return appointmentRepository.save(appointment);
    }

    private void ensureSlotAvailable(Appointment appointment, Long currentId) {
        if (appointment.getAppointmentDate() == null || appointment.getAppointmentTime() == null) {
            throw new IllegalArgumentException("Appointment date and time are required");
        }
        if (appointment.getStatus() == AppointmentStatus.CANCELLED
                || appointment.getStatus() == AppointmentStatus.REJECTED) return;
        Long doctorId = appointment.getDoctor().getId();
        boolean occupied = currentId == null
                ? appointmentRepository.existsByDoctor_IdAndAppointmentDateAndAppointmentTimeAndStatusIn(
                    doctorId, appointment.getAppointmentDate(), appointment.getAppointmentTime(), BOOKING_STATUSES)
                : appointmentRepository.existsByDoctor_IdAndAppointmentDateAndAppointmentTimeAndStatusInAndIdNot(
                    doctorId, appointment.getAppointmentDate(), appointment.getAppointmentTime(), BOOKING_STATUSES, currentId);
        if (occupied) throw new IllegalStateException("The doctor already has an appointment at that time");
    }

}
