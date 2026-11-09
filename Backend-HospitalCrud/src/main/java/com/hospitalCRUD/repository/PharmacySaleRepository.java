package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.PharmacySale;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PharmacySaleRepository extends JpaRepository<PharmacySale, Long> {
    boolean existsByInvoiceNumberIgnoreCase(String invoiceNumber);
    boolean existsByItems_Pharmacy_Id(Long pharmacyId);

    @EntityGraph(attributePaths = {"items", "items.pharmacy"})
    List<PharmacySale> findAllByOrderBySaleDateDescIdDesc();

    @EntityGraph(attributePaths = {"items", "items.pharmacy"})
    Optional<PharmacySale> findWithItemsById(Long id);
}
