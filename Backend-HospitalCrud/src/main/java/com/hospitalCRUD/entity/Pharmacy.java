package com.hospitalCRUD.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "pharmacy")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Pharmacy extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String medicineId;

    @Column(nullable = false)
    private String medicineName;

    private String category;

    private String manufacturer;

    @Column(length = 80)
    private String batchNumber;

    private Integer quantity;

    private BigDecimal unitPrice;

    @Column(precision = 12, scale = 2)
    private BigDecimal purchasePrice;

    @Column(precision = 12, scale = 2)
    private BigDecimal sellingPrice;

    @Column(nullable = false)
    private Integer lowStockThreshold = 10;

    private LocalDate expiryDate;

    private String supplier;

    private String status;
}
