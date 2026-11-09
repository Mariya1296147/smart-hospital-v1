package com.hospitalCRUD.dtos;

import com.hospitalCRUD.entity.AppointmentStatus;
import com.hospitalCRUD.entity.Patient;
import com.hospitalCRUD.entity.Doctor;
import com.hospitalCRUD.entity.Department;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDTO {

    private Long id;
    private String appointmentId;
    private Long patientId;
    private Long doctorId;
    private Long departmentId;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String reason;
    private Integer age;
    private String gender;
    private AppointmentStatus status;
    private String notes;

    // Angular's shared API service sends linked records as { id } references.
    private Patient patient;
    private Doctor doctor;
    private Department department;
}
