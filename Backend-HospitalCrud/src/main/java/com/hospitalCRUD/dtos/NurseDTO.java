package com.hospitalCRUD.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NurseDTO {

    private Long id;
    private String nurseId;
    private String name;
    private String gender;
    private String phone;
    private String email;
    private Long departmentId;
    private String department;
    private String ward;
    private String shift;
    private String qualification;
    private LocalDate joiningDate;
    private String status;
}
