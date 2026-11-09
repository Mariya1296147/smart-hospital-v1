package com.hospitalCRUD.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PharmacyPurchaseRequest(
        String invoiceNumber,
        String supplierName,
        String supplierContact,
        LocalDate purchaseDate,
        BigDecimal discount,
        List<PharmacyPurchaseLineRequest> items
) {}
