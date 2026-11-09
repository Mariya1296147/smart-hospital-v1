package com.hospitalCRUD.service;

import com.hospitalCRUD.dtos.LaboratoryWorkflowUpdateRequest;
import com.hospitalCRUD.entity.Billing;
import com.hospitalCRUD.entity.BillingItem;
import com.hospitalCRUD.entity.Doctor;
import com.hospitalCRUD.entity.Patient;
import com.hospitalCRUD.entity.Prescription;
import com.hospitalCRUD.entity.PrescriptionTest;
import com.hospitalCRUD.repository.BillingItemRepository;
import com.hospitalCRUD.repository.PrescriptionTestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LaboratoryWorkflowServiceTest {
    @Mock private BillingItemRepository billingItems;
    @Mock private PrescriptionTestRepository prescriptionTests;

    private LaboratoryWorkflowService service;
    private PrescriptionTest test;
    private BillingItem paidTestItem;

    @BeforeEach
    void setUp() throws Exception {
        service = new LaboratoryWorkflowService(billingItems, prescriptionTests);
        Patient patient = new Patient();
        setId(patient, 12L);
        patient.setName("Alex Patient");
        patient.setPatientId("PT-12");
        Doctor doctor = new Doctor();
        doctor.setName("Dr. Green");
        doctor.setEmail("green@example.test");
        Prescription prescription = new Prescription();
        setId(prescription, 44L);
        prescription.setDate(LocalDate.of(2026, 11, 7));
        prescription.setPatient(patient);
        prescription.setDoctor(doctor);
        test = new PrescriptionTest();
        setId(test, 87L);
        test.setPrescription(prescription);
        test.setTestCode("CBC");
        test.setTestName("Complete Blood Count");
        test.setLaboratoryStatus("PENDING");
        Billing billing = new Billing();
        billing.setInvoiceId("INV-TEST-1");
        billing.setPaymentStatus("PAID");
        paidTestItem = new BillingItem();
        paidTestItem.setBilling(billing);
        paidTestItem.setPrescriptionTest(test);
    }

    @Test
    void paidPrescribedTestAppearsOnceWithItsExistingInvoice() {
        stubPaidInvoice();
        when(prescriptionTests.findAllForLaboratoryByStatuses(List.of("PENDING"))).thenReturn(List.of(test));

        var queue = service.getWorklist("PENDING");

        assertEquals(1, queue.size());
        assertEquals(87L, queue.get(0).getId());
        assertEquals("Alex Patient", queue.get(0).getPatientName());
        assertEquals("PT-12", queue.get(0).getPatientCode());
        assertEquals("Dr. Green", queue.get(0).getDoctorName());
        assertEquals(LocalDate.of(2026, 11, 7), queue.get(0).getTestDate());
        assertEquals("PAID", queue.get(0).getBillingStatus());
        assertEquals("INV-TEST-1", queue.get(0).getInvoiceId());
    }

    @Test
    void inProgressQueueRequestsOnlyCollectedAndProcessingStatuses() {
        stubPaidInvoice();
        test.setLaboratoryStatus("PROCESSING");
        when(prescriptionTests.findAllForLaboratoryByStatuses(List.of("SAMPLE_COLLECTED", "PROCESSING")))
                .thenReturn(List.of(test));

        var queue = service.getWorklist("IN_PROGRESS");

        assertEquals(1, queue.size());
        assertEquals("PROCESSING", queue.get(0).getStatus());
    }

    @Test
    void unpaidPrescribedTestCannotBeProcessed() {
        when(prescriptionTests.findById(87L)).thenReturn(Optional.of(test));
        when(billingItems.isPrescriptionTestPaid(87L)).thenReturn(false);
        LaboratoryWorkflowUpdateRequest request = new LaboratoryWorkflowUpdateRequest();
        request.setStatus("SAMPLE_COLLECTED");

        assertThrows(IllegalArgumentException.class, () -> service.update(87L, request));
    }

    @Test
    void resultAndRemarksAreSavedOnTheExistingTestAfterValidStatusTransitions() {
        stubPaidInvoice();
        when(prescriptionTests.findById(87L)).thenReturn(Optional.of(test));
        when(billingItems.isPrescriptionTestPaid(87L)).thenReturn(true);
        LaboratoryWorkflowUpdateRequest collected = new LaboratoryWorkflowUpdateRequest();
        collected.setStatus("SAMPLE_COLLECTED");
        collected.setSampleDate(LocalDate.of(2026, 11, 8));
        service.update(87L, collected);

        LaboratoryWorkflowUpdateRequest processing = new LaboratoryWorkflowUpdateRequest();
        processing.setStatus("PROCESSING");
        service.update(87L, processing);

        LaboratoryWorkflowUpdateRequest completed = new LaboratoryWorkflowUpdateRequest();
        completed.setStatus("COMPLETED");
        completed.setResult("WBC 7.2 x10^9/L");
        completed.setRemarks("Within reference range");
        var report = service.update(87L, completed);

        assertEquals("COMPLETED", report.getStatus());
        assertEquals("WBC 7.2 x10^9/L", report.getResult());
        assertEquals("Within reference range", report.getRemarks());
        assertNotNull(report.getResultEnteredAt());
        assertEquals(LocalDate.of(2026, 11, 8), report.getSampleDate());
    }

    @Test
    void doctorReportQueryReturnsOnlyCompletedTestsFromDoctorRepositoryQuery() {
        stubPaidInvoice();
        test.setLaboratoryStatus("COMPLETED");
        when(prescriptionTests.findCompletedReportsForDoctor("green@example.test")).thenReturn(List.of(test));

        var reports = service.getCompletedReportsForDoctor("green@example.test");

        assertEquals(1, reports.size());
        assertEquals(87L, reports.get(0).getId());
        assertEquals("COMPLETED", reports.get(0).getStatus());
    }

    private void setId(Object entity, Long id) throws Exception {
        Field field = entity.getClass().getSuperclass().getDeclaredField("id");
        field.setAccessible(true);
        field.set(entity, id);
    }

    private void stubPaidInvoice() {
        when(billingItems.findByPrescriptionTestIds(anyCollection())).thenReturn(List.of(paidTestItem));
    }
}
