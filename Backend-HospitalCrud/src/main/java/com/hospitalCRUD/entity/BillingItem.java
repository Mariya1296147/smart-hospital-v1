package com.hospitalCRUD.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "billing_items")
@Getter
@Setter
@NoArgsConstructor
public class BillingItem extends BaseEntity {
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "billing_id", nullable = false)
    private Billing billing;

    @Column(nullable = false, length = 40)
    private String serviceCategory;

    @Column(nullable = false, length = 240)
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal quantity = BigDecimal.ONE;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal lineTotal = BigDecimal.ZERO;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_test_id", unique = true)
    private PrescriptionTest prescriptionTest;

    @Transient
    private Long prescriptionTestId;

    @JsonProperty
    public Long getPrescriptionTestId() {
        return prescriptionTest != null ? prescriptionTest.getId() : prescriptionTestId;
    }
}
