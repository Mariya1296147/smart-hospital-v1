package com.hospitalCRUD.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "wards")
@Getter
@Setter
@NoArgsConstructor
public class Ward extends BaseEntity {

    @Column(nullable = false)
    private String wardName;

    @Column(unique = true)
    private String wardNumber;

    private String wardType;

    private Integer capacity;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
}
