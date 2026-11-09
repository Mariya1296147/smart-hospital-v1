package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.Pharmacy;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface PharmacyRepository extends JpaRepository<Pharmacy, Long> {

    Optional<Pharmacy> findFirstByMedicineNameIgnoreCase(String medicineName);

    boolean existsByMedicineIdIgnoreCase(String medicineId);

    List<Pharmacy> findByMedicineNameIgnoreCaseAndBatchNumberIgnoreCase(String medicineName, String batchNumber);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select medicine from Pharmacy medicine where medicine.id = :id")
    Optional<Pharmacy> findByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select medicine from Pharmacy medicine where medicine.id in :ids order by medicine.id")
    List<Pharmacy> findAllByIdsForUpdate(@Param("ids") Collection<Long> ids);

}
