
package com.hospitalCRUD.dtos;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class PublicAppointmentRequest {

    private String patientName;
    private String email;
    private String phone;
    private Integer age;
    private String gender;

    private Long doctorId;
    private Long departmentId;

    private LocalDate appointmentDate;
    private LocalTime appointmentTime;

    private String message;
}
