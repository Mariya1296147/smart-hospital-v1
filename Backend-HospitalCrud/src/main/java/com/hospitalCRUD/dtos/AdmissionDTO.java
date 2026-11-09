package com.hospitalCRUD.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdmissionDTO {

    private Long id;
    private String admissionId;
    private Long patientId;
    private String patientName;
    private String patientCode;
    private String patientPhone;
    private Integer patientAge;
    private String patientGender;
    private Long doctorId;
    private String doctor;
    private Long departmentId;
    private String department;
    private LocalDate admissionDate;
    private LocalDate dischargeDate;
    private Long wardId;
    private String ward;
    private Long bedId;
    private String bed;
    private String bedType;
    private Long assignedNurseId;
    private String assignedNurseName;
    private String reason;
    private String status;
    private Long sourcePrescriptionId;

}
