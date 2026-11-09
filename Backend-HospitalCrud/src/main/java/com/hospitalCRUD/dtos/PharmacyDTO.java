package com.hospitalCRUD.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PharmacyDTO {

    private Long id;
    private String medicineId;
    private String medicineName;
    private String category;
    private String manufacturer;
    private Integer quantity;
    private BigDecimal unitPrice;
    private LocalDate expiryDate;
    private String supplier;
    private String status;
}