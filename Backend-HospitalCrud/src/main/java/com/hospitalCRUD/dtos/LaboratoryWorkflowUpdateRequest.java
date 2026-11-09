package com.hospitalCRUD.dtos;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class LaboratoryWorkflowUpdateRequest {
    private String status;
    private LocalDate sampleDate;
    private String result;
    private String remarks;
}
