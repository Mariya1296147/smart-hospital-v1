package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.Ward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface WardRepository extends JpaRepository<Ward, Long> {
    Optional<Ward> findFirstByWardNameIgnoreCase(String wardName);

    @Query("select w from Ward w where exists (select b.id from Bed b where b.ward = w " +
            "and upper(trim(coalesce(b.status, ''))) = 'AVAILABLE') order by w.wardName")
    java.util.List<Ward> findWithAvailableBeds();
}
