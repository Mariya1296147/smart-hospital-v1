package com.hospitalCRUD.dtos;

import java.math.BigDecimal;

public record PharmacyTransactionItemDTO(
        Long id,
        Long pharmacyId,
        String medicineId,
        String medicineName,
        String batchNumber,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal
) {}
