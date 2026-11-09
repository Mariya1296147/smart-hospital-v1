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
public class LaboratoryDTO {

    private Long id;
    private String testId;
    private Long patientId;
    private String testName;
    private Long departmentId;
    private Long doctorId;
    private LocalDate sampleDate;
    private String result;
    private String status;
}