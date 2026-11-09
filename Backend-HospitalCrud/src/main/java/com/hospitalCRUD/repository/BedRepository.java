package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface BedRepository extends JpaRepository<Bed, Long> {
    boolean existsByBedNumberIgnoreCase(String bedNumber);
    boolean existsByBedNumberIgnoreCaseAndIdNot(String bedNumber, Long id);
    boolean existsByWard_Id(Long wardId);
    long countByWard_Id(Long wardId);
    java.util.List<Bed> findByWard_Id(Long wardId);
    java.util.Optional<Bed> findFirstByBedNumberIgnoreCase(String bedNumber);

    @Query("select b from Bed b where upper(trim(coalesce(b.status, ''))) = 'AVAILABLE' " +
            "and (:wardId is null or b.ward.id = :wardId) order by b.ward.wardName, b.bedNumber")
    java.util.List<Bed> findAvailable(@Param("wardId") Long wardId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select bed from Bed bed where bed.id = :id")
    java.util.Optional<Bed> findLockedById(@Param("id") Long id);
}
