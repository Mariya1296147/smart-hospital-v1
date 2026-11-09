package com.hospitalCRUD.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LaboratoryWorkItemDTO {
    private Long id;
    private Long prescriptionId;
    private String invoiceId;
    private String billingStatus;
    private String patientName;
    private String patientCode;
    private String patientPhone;
    private String doctorName;
    private String departmentName;
    private String diagnosis;
    private String testCode;
    private String testName;
    private LocalDate testDate;
    private String status;
    private LocalDate sampleDate;
    private String result;
    private String remarks;
    private LocalDateTime resultEnteredAt;
}
