package com.hospitalCRUD.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "prescription_tests")
@Getter
@Setter
@NoArgsConstructor
public class PrescriptionTest extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "test_catalog_id", nullable = false)
    private TestCatalog catalogTest;

    @Column(nullable = false, length = 64)
    private String testCode;

    @Column(nullable = false, length = 160)
    private String testName;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(length = 24)
    private String laboratoryStatus = "PENDING";

    private LocalDate sampleDate;

    @Column(columnDefinition = "TEXT")
    private String laboratoryResult;

    @Column(columnDefinition = "TEXT")
    private String laboratoryRemarks;

    private LocalDateTime resultEnteredAt;
}
