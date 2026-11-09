package com.hospitalCRUD.dtos;

import com.hospitalCRUD.entity.DischargeStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DischargeDTO {

    private Long id;
    private String dischargeId;
    private Long patientId;
    private Long doctorId;
    private Long departmentId;
    private LocalDate admissionDate;
    private LocalDate dischargeDate;
    private String room;
    private String bed;
    private String dischargeType;
    private String diagnosis;
    private String treatment;
    private String prescription;
    private String instructions;
    private DischargeStatus status;
}