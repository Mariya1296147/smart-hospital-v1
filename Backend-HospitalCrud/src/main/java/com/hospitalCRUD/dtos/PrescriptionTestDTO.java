package com.hospitalCRUD.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionTestDTO {
    private Long id;
    private Long catalogTestId;
    private String testCode;
    private String testName;
    private BigDecimal price;
}
