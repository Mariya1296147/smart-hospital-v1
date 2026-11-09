package com.hospitalCRUD.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PharmacySaleRequest(
        String invoiceNumber,
        String customerName,
        String customerContact,
        LocalDate saleDate,
        BigDecimal discount,
        List<PharmacySaleLineRequest> items
) {}
