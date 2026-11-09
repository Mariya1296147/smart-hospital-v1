package com.hospitalCRUD.repository;

import com.hospitalCRUD.entity.PharmacyPurchase;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PharmacyPurchaseRepository extends JpaRepository<PharmacyPurchase, Long> {
    boolean existsByInvoiceNumberIgnoreCase(String invoiceNumber);
    boolean existsByItems_Pharmacy_Id(Long pharmacyId);

    @EntityGraph(attributePaths = {"items", "items.pharmacy"})
    List<PharmacyPurchase> findAllByOrderByPurchaseDateDescIdDesc();

    @EntityGraph(attributePaths = {"items", "items.pharmacy"})
    Optional<PharmacyPurchase> findWithItemsById(Long id);
}
