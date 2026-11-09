package com.hospitalCRUD.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonCreator;

@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
public class Department extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String departmentName;

    @Column(unique = true)
    private String departmentCode;

    private String description;


    @JsonCreator
    public static Department create(String departmentName) {
        Department department = new Department();
        department.setDepartmentName(departmentName);
        return department;
    }
}