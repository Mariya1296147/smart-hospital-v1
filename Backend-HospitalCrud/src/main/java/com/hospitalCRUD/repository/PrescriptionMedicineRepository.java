
package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.PrescriptionMedicine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrescriptionMedicineRepository
        extends JpaRepository<PrescriptionMedicine, Long> {

    List<PrescriptionMedicine> findByPrescription_Id(Long prescriptionId);

    boolean existsByPharmacy_Id(Long pharmacyId);

    void deleteByPrescription_Id(Long prescriptionId);
}
