package com.hospitalCRUD.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PharmacyTransactionDTO(
        Long id,
        String invoiceNumber,
        String supplierName,
        String supplierContact,
        String customerName,
        String customerContact,
        LocalDate transactionDate,
        BigDecimal subtotal,
        BigDecimal discount,
        BigDecimal totalAmount,
        List<PharmacyTransactionItemDTO> items
) {}
