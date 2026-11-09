package com.hospitalCRUD.reports;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PharmacyInvoicePdfGeneratorTest {
    @Test
    void generatesAReadableInvoicePdfWithLineItems() {
        var generator = new PharmacyInvoicePdfGenerator();
        byte[] pdf = generator.generate("SAL-TEST", "SALES RECEIPT", LocalDate.of(2026, 11, 9), "Customer", "Walk-in", "",
                List.of(new PharmacyInvoicePdfGenerator.Line("Medicine", "B-1", 2, new BigDecimal("10.00"), new BigDecimal("20.00"))),
                new BigDecimal("20.00"), BigDecimal.ZERO, new BigDecimal("20.00"));
        assertTrue(new String(pdf, 0, 5).equals("%PDF-"));
        assertTrue(pdf.length > 500);
    }
}
