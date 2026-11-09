package com.hospitalCRUD.dtos;

import java.time.LocalDate;

public record DoctorPatientDTO(
        String patientId,
        String name,
        Integer age,
        String gender,
        String bloodGroup,
        String phone,
        String department,
        String appointmentStatus,
        LocalDate lastAppointmentDate
) {
}
