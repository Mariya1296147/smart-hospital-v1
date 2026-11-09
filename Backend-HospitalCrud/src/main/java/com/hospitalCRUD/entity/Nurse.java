package com.hospitalCRUD.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "nurses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Nurse extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String nurseId;

    @Column(nullable = false)
    private String name;

    private String gender;

    private String phone;

    @Column(unique = true)
    private String email;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    private String ward;

    /** Structured ward assignment, retained alongside the legacy ward label. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ward_id")
    private Ward wardRef;

    private String shift;

    private String qualification;

    private LocalDate joiningDate;

    private String status;

    /** Login account used by this nurse; legacy profiles may not yet be linked. */
    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_name", unique = true)
    private User user;
}
