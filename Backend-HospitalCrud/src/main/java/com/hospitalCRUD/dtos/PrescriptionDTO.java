
package com.hospitalCRUD.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import com.hospitalCRUD.entity.AppointmentStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDTO {

    private Long id;

    private Long patientId;
    private Long doctorId;
    private Long departmentId;

    private String patientName;
    private String doctorName;
    private String departmentName;

    private String diagnosis;

    private List<PrescriptionMedicineDTO> medicines;

    private String advice;

    private LocalDate date;

    private Long consultationId;

    private List<PrescriptionTestDTO> tests;

    // ApiService sends JPA references as { id } for prescription writes.
    private PrescriptionReferenceDTO patient;
    private PrescriptionReferenceDTO doctor;
    private PrescriptionReferenceDTO department;

    private Long appointmentId;
    private AppointmentStatus appointmentStatus;
    private Boolean admissionRequired;
    private String admissionReason;
    private Integer age;
    private String gender;
    private String patientCode;
}
