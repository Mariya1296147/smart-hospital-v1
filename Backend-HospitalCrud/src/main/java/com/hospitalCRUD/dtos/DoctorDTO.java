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
public class DoctorDTO {

    private Long id;
    private String doctorId;
    private String name;
    private String email;
    private String phone;
    private String gender;
    private String specialization;
    private String qualification;
    private String experience;
    private String department;
    private String availableTime;
    private LocalDate joiningDate;
    private String status;
    private String imageUrl;
}
