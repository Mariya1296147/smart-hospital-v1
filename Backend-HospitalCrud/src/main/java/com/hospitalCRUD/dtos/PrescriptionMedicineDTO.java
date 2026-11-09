
package com.hospitalCRUD.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionMedicineDTO {

    private Long id;
    private String medicineName;
    private String dosage;
    private String frequency;
    private String duration;
    private String instruction;
}
