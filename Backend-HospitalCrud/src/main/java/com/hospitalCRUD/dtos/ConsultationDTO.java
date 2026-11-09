package com.hospitalCRUD.dtos;

import com.hospitalCRUD.entity.ConsultationStatus;
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
public class ConsultationDTO {

    private Long id;
    private String consultationId;
    private Long patientId;
    private Long doctorId;
    private Long departmentId;
    private LocalDate date;
    private LocalTime time;
    private String type;
    private String symptoms;
    private String diagnosis;
    private String notes;
    private ConsultationStatus status;
}