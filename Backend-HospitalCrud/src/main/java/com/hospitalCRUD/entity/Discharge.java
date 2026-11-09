package com.hospitalCRUD.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "discharges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Discharge extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String dischargeId;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admission_id")
    private Admission admission;

    private LocalDate admissionDate;

    private LocalDate dischargeDate;

    private String room;

    private String bed;

    private String dischargeType;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String treatment;

    @Column(columnDefinition = "TEXT")
    private String prescription;

    @Column(columnDefinition = "TEXT")
    private String instructions;

//    @Enumerated(EnumType.STRING)
//    private DischargeStatus status;
}
