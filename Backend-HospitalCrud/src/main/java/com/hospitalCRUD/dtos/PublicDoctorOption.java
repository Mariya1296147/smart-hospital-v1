package com.hospitalCRUD.dtos;

public record PublicDoctorOption(
        Long id,
        String name,
        String specialization,
        String qualification,
        String experience,
        String imageUrl,
        Long departmentId,
        String departmentName
) {
}
