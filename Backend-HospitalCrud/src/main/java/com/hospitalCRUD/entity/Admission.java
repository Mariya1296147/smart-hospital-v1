package com.hospitalCRUD.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "admissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Admission extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String admissionId;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne
    @JoinColumn(name = "ward_id")
    private Ward ward;

    @ManyToOne
    @JoinColumn(name = "bed_id")
    private Bed bed;

    /** Nurse responsible for this admission; populated when an admission is confirmed. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_nurse_id")
    private Nurse assignedNurse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_prescription_id", unique = true)
    private Prescription sourcePrescription;

    private LocalDate admissionDate;

    private LocalDate dischargeDate;

    private String reason;

    private String status = "ADMITTED";
}
