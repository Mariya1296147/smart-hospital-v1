
package com.hospitalCRUD.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Doctor extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String doctorId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    private String gender;

    private String specialization;

    private String qualification;

    private String experience;

    private String availableTime;

    private LocalDate joiningDate;

    private String status;

    @Column(length = 512)
    private String imageUrl;

    /** Login account used by this doctor; legacy profiles may not yet be linked. */
    @JsonIgnore
    @jakarta.persistence.OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_name", unique = true)
    private User user;

    // Many Doctors can belong to one Department
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;
}
