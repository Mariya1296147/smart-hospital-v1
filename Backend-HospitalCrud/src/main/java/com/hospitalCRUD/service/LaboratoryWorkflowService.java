package com.hospitalCRUD.service;

import com.hospitalCRUD.dtos.LaboratoryWorkItemDTO;
import com.hospitalCRUD.dtos.LaboratoryWorkflowUpdateRequest;
import com.hospitalCRUD.entity.BillingItem;
import com.hospitalCRUD.entity.Billing;
import com.hospitalCRUD.entity.Department;
import com.hospitalCRUD.entity.Prescription;
import com.hospitalCRUD.entity.PrescriptionTest;
import com.hospitalCRUD.repository.BillingItemRepository;
import com.hospitalCRUD.repository.PrescriptionTestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.Map;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LaboratoryWorkflowService {
    private static final String PENDING = "PENDING";
    private static final String SAMPLE_COLLECTED = "SAMPLE_COLLECTED";
    private static final String PROCESSING = "PROCESSING";
    private static final String COMPLETED = "COMPLETED";

    private final BillingItemRepository billingItemRepository;
    private final PrescriptionTestRepository prescriptionTestRepository;

    public List<LaboratoryWorkItemDTO> getWorklist(String status) {
        String normalized = status == null || status.isBlank() ? null : normalize(status);
        List<PrescriptionTest> tests;
        if (normalized == null) {
            tests = prescriptionTestRepository.findAllForLaboratory();
        } else {
            List<String> statuses = "IN_PROGRESS".equals(normalized)
                    ? List.of(SAMPLE_COLLECTED, PROCESSING)
                    : List.of(normalized);
            tests = prescriptionTestRepository.findAllForLaboratoryByStatuses(statuses);
        }
        Map<Long, BillingItem> invoices = billingItemsByTest(tests);
        return tests.stream()
                .map(test -> toDto(test, invoices.get(test.getId())))
                .sorted(Comparator.comparing(LaboratoryWorkItemDTO::getPrescriptionId).reversed()
                        .thenComparing(LaboratoryWorkItemDTO::getId))
                .toList();
    }

    public List<LaboratoryWorkItemDTO> getCompletedReportsForDoctor(String email) {
        List<PrescriptionTest> tests = prescriptionTestRepository.findCompletedReportsForDoctor(email);
        Map<Long, BillingItem> invoices = billingItemsByTest(tests);
        return tests.stream().map(test -> toDto(test, invoices.get(test.getId()))).toList();
    }

    @Transactional
    public LaboratoryWorkItemDTO update(Long testId, LaboratoryWorkflowUpdateRequest request) {
        PrescriptionTest test = prescriptionTestRepository.findById(testId)
                .orElseThrow(() -> new IllegalArgumentException("Prescribed test not found"));
        if (!billingItemRepository.isPrescriptionTestPaid(testId)) {
            throw new IllegalArgumentException("A paid invoice is required before laboratory processing");
        }
        String current = effectiveStatus(test.getLaboratoryStatus());
        String target = normalize(request == null ? null : request.getStatus());

        switch (target) {
            case SAMPLE_COLLECTED -> {
                requireStatus(current, PENDING, "Only pending tests can be collected");
                test.setSampleDate(request.getSampleDate() == null ? LocalDate.now() : request.getSampleDate());
            }
            case PROCESSING -> requireStatus(current, SAMPLE_COLLECTED, "Collect the sample before processing");
            case COMPLETED -> {
                requireStatus(current, PROCESSING, "Start processing before entering a result");
                String result = request.getResult() == null ? "" : request.getResult().trim();
                if (result.isBlank()) throw new IllegalArgumentException("Enter the test result before completing the test");
                String remarks = request.getRemarks() == null ? "" : request.getRemarks().trim();
                if (remarks.length() > 10000) throw new IllegalArgumentException("Remarks cannot exceed 10,000 characters");
                test.setLaboratoryResult(result);
                test.setLaboratoryRemarks(remarks);
                test.setResultEnteredAt(LocalDateTime.now());
            }
            default -> throw new IllegalArgumentException("Unsupported laboratory status");
        }

        test.setLaboratoryStatus(target);
        return toDto(test, billingItemRepository.findByPrescriptionTestIds(List.of(testId)).stream().findFirst().orElse(null));
    }

    private Map<Long, BillingItem> billingItemsByTest(List<PrescriptionTest> tests) {
        Set<Long> testIds = tests.stream().map(PrescriptionTest::getId).collect(Collectors.toSet());
        if (testIds.isEmpty()) return Map.of();
        return billingItemRepository.findByPrescriptionTestIds(testIds).stream()
                .collect(Collectors.toMap(item -> item.getPrescriptionTest().getId(), Function.identity(), (first, duplicate) -> first));
    }

    private LaboratoryWorkItemDTO toDto(PrescriptionTest test, BillingItem item) {
        Prescription prescription = test.getPrescription();
        Billing billing = item == null ? null : item.getBilling();
        Department department = prescription.getDepartment() != null
                ? prescription.getDepartment()
                : prescription.getDoctor() == null ? null : prescription.getDoctor().getDepartment();
        return new LaboratoryWorkItemDTO(
                test.getId(),
                prescription.getId(),
                billing == null ? null : billing.getInvoiceId(),
                billing == null ? "NOT_INVOICED" : billing.getPaymentStatus(),
                prescription.getPatient() == null ? "" : prescription.getPatient().getName(),
                prescription.getPatient() == null ? "" : prescription.getPatient().getPatientId(),
                prescription.getPatient() == null ? "" : prescription.getPatient().getPhone(),
                prescription.getDoctor() == null ? "" : prescription.getDoctor().getName(),
                department == null ? "" : department.getDepartmentName(),
                prescription.getDiagnosis(),
                test.getTestCode(),
                test.getTestName(),
                prescription.getDate(),
                effectiveStatus(test.getLaboratoryStatus()),
                test.getSampleDate(),
                test.getLaboratoryResult(),
                test.getLaboratoryRemarks(),
                test.getResultEnteredAt());
    }

    private void requireStatus(String current, String expected, String message) {
        if (!expected.equals(current)) throw new IllegalArgumentException(message);
    }

    private String effectiveStatus(String status) {
        return status == null || status.isBlank() ? PENDING : status.toUpperCase(Locale.ROOT);
    }

    private String normalize(String status) {
        if (status == null || status.isBlank()) throw new IllegalArgumentException("Laboratory status is required");
        String normalized = status.trim().toUpperCase(Locale.ROOT).replace('-', '_').replace(' ', '_');
        return switch (normalized) {
            case PENDING, SAMPLE_COLLECTED, PROCESSING, COMPLETED, "IN_PROGRESS" -> normalized;
            default -> throw new IllegalArgumentException("Unsupported laboratory status");
        };
    }
}
