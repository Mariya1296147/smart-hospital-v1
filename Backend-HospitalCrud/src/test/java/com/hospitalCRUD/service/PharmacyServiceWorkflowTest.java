package com.hospitalCRUD.service;

import com.hospitalCRUD.dtos.*;
import com.hospitalCRUD.entity.Pharmacy;
import com.hospitalCRUD.entity.PharmacyPurchase;
import com.hospitalCRUD.entity.PharmacySale;
import com.hospitalCRUD.repository.*;
import com.hospitalCRUD.reports.PharmacyInvoicePdfGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PharmacyServiceWorkflowTest {
    @Mock PharmacyRepository pharmacyRepository;
    @Mock PharmacyPurchaseRepository purchaseRepository;
    @Mock PharmacySaleRepository saleRepository;
    @Mock PrescriptionMedicineRepository prescriptionMedicineRepository;
    private PharmacyService service;

    @BeforeEach void setup() { service = new PharmacyService(pharmacyRepository, purchaseRepository, saleRepository, prescriptionMedicineRepository, new PharmacyInvoicePdfGenerator()); }

    @Test void purchaseAddsStockAndPersistsPdf() {
        when(purchaseRepository.existsByInvoiceNumberIgnoreCase("PUR-ONE")).thenReturn(false);
        when(pharmacyRepository.findByMedicineNameIgnoreCaseAndBatchNumberIgnoreCase("Medicine A", "B-1")).thenReturn(List.of());
        when(pharmacyRepository.existsByMedicineIdIgnoreCase(any())).thenReturn(false);
        when(pharmacyRepository.save(any(Pharmacy.class))).thenAnswer(call -> call.getArgument(0));
        when(purchaseRepository.saveAndFlush(any())).thenAnswer(call -> call.getArgument(0));
        when(purchaseRepository.save(any())).thenAnswer(call -> call.getArgument(0));
        var request = new PharmacyPurchaseRequest("PUR-ONE", "Supplier A", "555", LocalDate.now(), BigDecimal.ZERO,
                List.of(new PharmacyPurchaseLineRequest(null, null, "Medicine A", "Pain Relief", "Maker", "B-1", new BigDecimal("4.00"), new BigDecimal("6.00"), 12, LocalDate.now().plusYears(1))));

        PharmacyTransactionDTO result = service.createPurchase(request);

        assertEquals("PUR-ONE", result.invoiceNumber());
        assertEquals(new BigDecimal("48.00"), result.totalAmount());
        assertEquals(12, result.items().get(0).quantity());
        verify(purchaseRepository).save(argThat(p -> ((PharmacyPurchase)p).getInvoicePdf() != null && ((PharmacyPurchase)p).getInvoicePdf().length > 500));
        verify(pharmacyRepository).save(argThat(m -> m.getQuantity() == 12 && "B-1".equals(m.getBatchNumber())));
    }

    @Test void saleDecrementsStockAndRejectsInsufficientQuantity() {
        Pharmacy medicine = new Pharmacy(); medicine.setMedicineId("MED-A"); medicine.setMedicineName("Medicine A"); medicine.setQuantity(10);
        ReflectionTestUtils.setField(medicine, "id", 4L);
        medicine.setSellingPrice(new BigDecimal("3.50")); medicine.setUnitPrice(new BigDecimal("3.50")); medicine.setLowStockThreshold(2); medicine.setExpiryDate(LocalDate.now().plusYears(1));
        when(saleRepository.existsByInvoiceNumberIgnoreCase("SAL-ONE")).thenReturn(false);
        when(pharmacyRepository.findAllByIdsForUpdate(Set.of(4L))).thenReturn(List.of(medicine));
        when(saleRepository.saveAndFlush(any())).thenAnswer(call -> call.getArgument(0));
        when(saleRepository.save(any())).thenAnswer(call -> call.getArgument(0));
        var request = new PharmacySaleRequest("SAL-ONE", "Customer A", null, LocalDate.now(), BigDecimal.ZERO, List.of(new PharmacySaleLineRequest(4L, 3)));

        PharmacyTransactionDTO result = service.createSale(request);

        assertEquals(7, medicine.getQuantity());
        assertEquals(new BigDecimal("10.50"), result.totalAmount());
        verify(saleRepository).save(argThat(s -> ((PharmacySale)s).getInvoicePdf() != null));
        assertThrows(IllegalStateException.class, () -> service.createSale(new PharmacySaleRequest("SAL-TWO", null, null, LocalDate.now(), BigDecimal.ZERO, List.of(new PharmacySaleLineRequest(4L, 8)))));
        assertEquals(7, medicine.getQuantity());
    }
}
