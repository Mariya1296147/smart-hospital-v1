
package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.Appointment;
import com.hospitalCRUD.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;

public interface AppointmentRepository
        extends JpaRepository<Appointment, Long> {

    List<Appointment> findByDoctor_EmailIgnoreCaseAndStatus(
            String email,
            AppointmentStatus status
    );

    List<Appointment> findByDoctor_EmailIgnoreCase(String email);

    List<Appointment> findByPatient_EmailIgnoreCase(String email);

    List<Appointment> findByStatusOrderByAppointmentDateDesc(AppointmentStatus status);

    boolean existsByDoctor_EmailIgnoreCaseAndPatient_IdAndStatus(
            String email,
            Long patientId,
            AppointmentStatus status
    );

    boolean existsByDoctor_IdAndAppointmentDateAndAppointmentTimeAndStatusIn(
            Long doctorId, LocalDate date, LocalTime time, Collection<AppointmentStatus> statuses);

    boolean existsByDoctor_IdAndAppointmentDateAndAppointmentTimeAndStatusInAndIdNot(
            Long doctorId, LocalDate date, LocalTime time, Collection<AppointmentStatus> statuses, Long id);
}
