package com.hospitalCRUD.dtos;

import com.hospitalCRUD.entity.AppointmentStatus;
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
public class CompletedDoctorVisitDTO {
    private Long appointmentId;
    private String appointmentCode;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private AppointmentStatus status;
    private String reason;
    private String notes;
    private Integer age;
    private String gender;
    private Long patientRecordId;
    private String patientCode;
    private String patientName;
    private String patientPhone;
    private String doctorName;
    private String departmentName;
    private PrescriptionDTO prescription;
    private boolean receiptExists;
}
