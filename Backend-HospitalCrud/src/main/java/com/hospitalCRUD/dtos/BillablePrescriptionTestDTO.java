package com.hospitalCRUD.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class BillablePrescriptionTestDTO {
    private Long prescriptionTestId;
    private Long prescriptionId;
    private Long patientRecordId;
    private String patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private Long departmentId;
    private String departmentName;
    private String diagnosis;
    private String testCode;
    private String testName;
    private BigDecimal price;
}
