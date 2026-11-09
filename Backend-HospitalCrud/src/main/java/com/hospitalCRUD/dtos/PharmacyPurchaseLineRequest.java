package com.hospitalCRUD.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PharmacyPurchaseLineRequest(
        Long pharmacyId,
        String medicineId,
        String medicineName,
        String category,
        String manufacturer,
        String batchNumber,
        BigDecimal purchasePrice,
        BigDecimal sellingPrice,
        Integer quantity,
        LocalDate expiryDate
) {}
