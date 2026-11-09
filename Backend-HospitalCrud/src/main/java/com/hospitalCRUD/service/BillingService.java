package com.hospitalCRUD.service;

import com.hospitalCRUD.dtos.BillablePrescriptionTestDTO;
import com.hospitalCRUD.dtos.BillingPaymentRequest;
import com.hospitalCRUD.entity.*;
import com.hospitalCRUD.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class BillingService {

    private final BillingRepository billingRepository;
    private final BillingItemRepository billingItemRepository;
    private final BillingPaymentRepository paymentRepository;
    private final PrescriptionTestRepository prescriptionTestRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional(readOnly = true)
    public List<Billing> getAll() {
        List<Billing> bills = billingRepository.findAll();
        bills.forEach(this::populateLegacyPaidAmount);
        return bills;
    }

    @Transactional(readOnly = true)
    public List<Billing> getVisibleBills(Authentication authentication) {
        List<Billing> bills = billingRepository.findAll();
        bills.removeIf(bill -> !canAccessBillingCategory(bill, authentication));
        bills.forEach(this::populateLegacyPaidAmount);
        return bills;
    }

    @Transactional(readOnly = true)
    public Billing getById(Long id) {
        Billing bill = billingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Billing not found"));
        populateLegacyPaidAmount(bill);
        return bill;
    }

    @Transactional(readOnly = true)
    public Billing getByIdForRole(Long id, Authentication authentication) {
        Billing bill = billingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Billing not found"));
        populateLegacyPaidAmount(bill);
        requireBillingCategoryAccess(bill, authentication);
        return bill;
    }

    public boolean isDoctorVisit(Billing billing) {
        if (billing == null) return false;
        if (billing.getAppointment() != null) return true;
        if (billing.getItems() != null && billing.getItems().stream()
                .anyMatch(item -> "DOCTOR_VISIT".equalsIgnoreCase(clean(item.getServiceCategory())))) return true;
        String serviceName = clean(billing.getServiceName());
        return serviceName != null && serviceName.toUpperCase(Locale.ROOT).startsWith("DOCTOR VISIT");
    }

    public boolean canAccessBillingCategory(Billing billing, Authentication authentication) {
        boolean receptionist = hasRole(authentication, "ROLE_RECEPTIONIST");
        return isDoctorVisit(billing) ? receptionist : !receptionist;
    }

    public void requireBillingCategoryAccess(Billing billing, Authentication authentication) {
        if (!canAccessBillingCategory(billing, authentication)) {
            throw new AccessDeniedException("This invoice category is not available to your role");
        }
    }

    @Transactional(readOnly = true)
    public List<BillablePrescriptionTestDTO> getUnbilledPrescriptionTests() {
        Set<Long> linked = billingItemRepository.findLinkedPrescriptionTestIds();
        return prescriptionTestRepository.findAll().stream()
                .filter(test -> !linked.contains(test.getId()))
                .sorted(Comparator.comparing(PrescriptionTest::getId))
                .map(test -> {
                    Prescription prescription = test.getPrescription();
                    Patient patient = prescription.getPatient();
                    Doctor doctor = prescription.getDoctor();
                    Department department = prescription.getDepartment() != null
                            ? prescription.getDepartment() : doctor.getDepartment();
                    return new BillablePrescriptionTestDTO(
                            test.getId(), prescription.getId(), patient.getId(), patient.getPatientId(), patient.getName(),
                            doctor.getId(), doctor.getName(), department == null ? null : department.getId(),
                            department == null ? null : department.getDepartmentName(), prescription.getDiagnosis(),
                            test.getTestCode(), test.getTestName(), test.getPrice());
                }).toList();
    }

    public Billing create(Billing billing) {
        Billing newBilling = new Billing();
        newBilling.setInvoiceId(billing.getInvoiceId());
        newBilling.setPatient(billing.getPatient());
        newBilling.setDoctor(billing.getDoctor());
        newBilling.setDepartment(billing.getDepartment());
        newBilling.setAppointment(billing.getAppointment());
        newBilling.setServiceName(billing.getServiceName());
        newBilling.setAmount(billing.getAmount());
        newBilling.setDiscount(billing.getDiscount());
        newBilling.setTax(billing.getTax());
        newBilling.setTotalAmount(billing.getTotalAmount());
        newBilling.setPaymentStatus(billing.getPaymentStatus());
        newBilling.setInvoiceDate(billing.getInvoiceDate() == null ? LocalDate.now() : billing.getInvoiceDate());
        newBilling.setPaidAmount(billing.getPaidAmount());

        linkReferences(newBilling);
        applyItems(newBilling, billing.getItems(), false);
        validateCategoryComposition(newBilling);
        calculateTotal(newBilling);
        initializePaidAmount(newBilling);
        return billingRepository.save(newBilling);
    }

    public Billing update(Long id, Billing billing) {
        Billing existing = getById(id);
        if (isDoctorVisit(existing) != isDoctorVisit(billing)) {
            throw new IllegalArgumentException("An invoice cannot be changed between Doctor Visit and Accounts billing");
        }
        existing.setInvoiceId(billing.getInvoiceId());
        existing.setPatient(billing.getPatient());
        existing.setDoctor(billing.getDoctor());
        existing.setDepartment(billing.getDepartment());
        existing.setAppointment(billing.getAppointment());
        existing.setServiceName(billing.getServiceName());
        existing.setAmount(billing.getAmount());
        existing.setDiscount(billing.getDiscount());
        existing.setTax(billing.getTax());
        existing.setInvoiceDate(billing.getInvoiceDate());

        linkReferences(existing);
        applyItems(existing, billing.getItems(), true);
        validateCategoryComposition(existing);
        calculateTotal(existing);
        refreshPaymentStatus(existing);
        return billingRepository.save(existing);
    }

    public BillingPayment addPayment(Long billingId, BillingPaymentRequest request) {
        Billing billing = getById(billingId);
        if (request == null || request.getAmount() == null || request.getAmount().signum() <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero");
        }
        BigDecimal currentPaid = settledAmount(billing);
        BigDecimal due = billing.getTotalAmount().subtract(currentPaid);
        if (request.getAmount().compareTo(due) > 0) {
            throw new IllegalArgumentException("Payment cannot exceed the remaining balance");
        }

        BillingPayment payment = new BillingPayment();
        payment.setBilling(billing);
        payment.setReceiptNumber("RCT-" + LocalDate.now().toString().replace("-", "") + "-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT));
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(clean(request.getPaymentMethod()));
        payment.setReference(clean(request.getReference()));
        payment.setNotes(clean(request.getNotes()));
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        billing.setPaidAmount(currentPaid.add(request.getAmount()));
        refreshPaymentStatus(billing);
        billingRepository.save(billing);
        return payment;
    }

    @Transactional(readOnly = true)
    public List<BillingPayment> getPayments(Long billingId) {
        getById(billingId);
        return paymentRepository.findByBilling_IdOrderByPaidAtDesc(billingId);
    }

    @Transactional(readOnly = true)
    public BillingPayment getPayment(Long billingId, Long paymentId) {
        return paymentRepository.findByIdAndBilling_Id(paymentId, billingId)
                .orElseThrow(() -> new IllegalArgumentException("Payment receipt not found"));
    }

    public void delete(Long id) {
        billingRepository.deleteById(id);
    }

    private void applyItems(Billing billing, List<BillingItem> requestItems, boolean updating) {
        List<BillingItem> incoming = requestItems == null ? List.of() : requestItems;
        if (!updating && incoming.stream().anyMatch(item -> item.getId() != null)) {
            throw new IllegalArgumentException("New invoice items cannot contain existing item IDs");
        }

        Map<Long, BillingItem> existing = new HashMap<>();
        if (updating) billing.getItems().forEach(item -> existing.put(item.getId(), item));
        Set<Long> retained = new HashSet<>();
        List<BillingItem> applied = new ArrayList<>();

        for (BillingItem submitted : incoming) {
            BillingItem item;
            if (submitted.getId() != null) {
                item = existing.get(submitted.getId());
                if (item == null || !retained.add(item.getId())) {
                    throw new IllegalArgumentException("Invoice item does not belong to this invoice");
                }
            } else {
                item = new BillingItem();
            }
            item.setBilling(billing);
            item.setServiceCategory(clean(submitted.getServiceCategory()) == null ? "OTHER" : submitted.getServiceCategory().trim());
            item.setDescription(clean(submitted.getDescription()));
            item.setQuantity(submitted.getQuantity());
            item.setUnitPrice(submitted.getUnitPrice());
            Long linkedTestId = submitted.getPrescriptionTest() == null
                    ? submitted.getPrescriptionTestId() : submitted.getPrescriptionTest().getId();
            linkPrescriptionTest(billing, item, linkedTestId);
            if (item.getDescription() == null || item.getQuantity() == null || item.getQuantity().signum() <= 0
                    || item.getUnitPrice() == null || item.getUnitPrice().signum() < 0) {
                throw new IllegalArgumentException("Each invoice item needs a description, positive quantity and non-negative price");
            }
            item.setLineTotal(item.getQuantity().multiply(item.getUnitPrice()).setScale(2, java.math.RoundingMode.HALF_UP));
            applied.add(item);
        }

        if (incoming.isEmpty()) {
            billing.getItems().clear();
            return;
        }
        billing.getItems().removeIf(item -> item.getId() != null && !retained.contains(item.getId()));
        for (BillingItem item : applied) {
            if (!billing.getItems().contains(item)) billing.getItems().add(item);
        }
    }

    private void linkPrescriptionTest(Billing billing, BillingItem item, Long requestedTestId) {
        if (requestedTestId == null) {
            item.setPrescriptionTest(null);
            return;
        }
        PrescriptionTest test = prescriptionTestRepository.findById(requestedTestId)
                .orElseThrow(() -> new IllegalArgumentException("Prescribed test not found"));
        Patient patient = test.getPrescription().getPatient();
        if (!patient.getId().equals(billing.getPatient().getId())) {
            throw new IllegalArgumentException("All prescribed tests on an invoice must belong to the selected patient");
        }
        boolean usedElsewhere = billing.getId() == null
                ? billingItemRepository.existsByPrescriptionTest_Id(test.getId())
                : billingItemRepository.existsByPrescriptionTest_IdAndBilling_IdNot(test.getId(), billing.getId());
        if (usedElsewhere) throw new IllegalArgumentException("This prescribed test is already on an invoice");

        item.setPrescriptionTest(test);
        item.setServiceCategory("LABORATORY_TEST");
        item.setDescription(test.getTestName() + (test.getTestCode() == null || test.getTestCode().isBlank() ? "" : " (" + test.getTestCode() + ")"));
        item.setQuantity(BigDecimal.ONE);
        item.setUnitPrice(test.getPrice());
        if (billing.getDoctor() == null) billing.setDoctor(test.getPrescription().getDoctor());
        if (billing.getDepartment() == null) billing.setDepartment(test.getPrescription().getDepartment());
    }

    private void linkReferences(Billing billing) {
        if (billing.getPatient() == null || billing.getPatient().getId() == null) {
            throw new IllegalArgumentException("A valid patient must be selected for billing");
        }
        billing.setPatient(patientRepository.findById(billing.getPatient().getId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found")));
        if (billing.getDoctor() != null && billing.getDoctor().getId() != null) {
            billing.setDoctor(doctorRepository.findById(billing.getDoctor().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Doctor not found")));
        }
        if (billing.getDepartment() != null && billing.getDepartment().getId() != null) {
            billing.setDepartment(departmentRepository.findById(billing.getDepartment().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found")));
        } else if (billing.getDoctor() != null) {
            billing.setDepartment(billing.getDoctor().getDepartment());
        }
        if (billing.getAppointment() != null) {
            if (billing.getAppointment().getId() == null) {
                throw new IllegalArgumentException("A valid appointment must be selected for visit billing");
            }
            Appointment appointment = appointmentRepository.findById(billing.getAppointment().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
            if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
                throw new IllegalArgumentException("Only completed doctor visits can be billed");
            }
            if (!appointment.getPatient().getId().equals(billing.getPatient().getId())) {
                throw new IllegalArgumentException("The appointment and invoice must belong to the same patient");
            }
            boolean alreadyBilled = billing.getId() == null
                    ? billingRepository.existsByAppointment_Id(appointment.getId())
                    : billingRepository.existsByAppointment_IdAndIdNot(appointment.getId(), billing.getId());
            if (alreadyBilled) throw new IllegalArgumentException("An invoice already exists for this appointment");
            billing.setAppointment(appointment);
        }
    }

    private void calculateTotal(Billing billing) {
        if (billing.getItems() != null && !billing.getItems().isEmpty()) {
            BigDecimal subtotal = billing.getItems().stream().map(BillingItem::getLineTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            billing.setAmount(subtotal);
            String summary = billing.getItems().stream().map(BillingItem::getServiceCategory).distinct()
                    .map(this::categoryLabel).reduce((a, b) -> a + ", " + b).orElse("Hospital Services");
            billing.setServiceName(summary);
        }
        if (billing.getAmount() == null || billing.getAmount().signum() < 0) {
            throw new IllegalArgumentException("Billing amount must be zero or greater");
        }
        if (billing.getPaidAmount() != null && billing.getPaidAmount().signum() < 0) {
            throw new IllegalArgumentException("Paid amount cannot be negative");
        }
        BigDecimal discount = billing.getDiscount() == null ? BigDecimal.ZERO : billing.getDiscount();
        BigDecimal tax = billing.getTax() == null ? BigDecimal.ZERO : billing.getTax();
        if (discount.signum() < 0 || tax.signum() < 0) {
            throw new IllegalArgumentException("Discount and tax cannot be negative");
        }
        BigDecimal total = billing.getAmount().subtract(discount).add(tax).setScale(2, java.math.RoundingMode.HALF_UP);
        if (total.signum() < 0) throw new IllegalArgumentException("Discount cannot exceed the billed amount");
        if (settledAmount(billing).compareTo(total) > 0) {
            throw new IllegalArgumentException("Invoice total cannot be lower than payments already received");
        }
        billing.setDiscount(discount);
        billing.setTax(tax);
        billing.setTotalAmount(total);
    }

    private void initializePaidAmount(Billing billing) {
        if (billing.getPaidAmount() == null) {
            billing.setPaidAmount("Paid".equalsIgnoreCase(billing.getPaymentStatus())
                    ? billing.getTotalAmount() : BigDecimal.ZERO);
        }
        refreshPaymentStatus(billing);
    }

    private void populateLegacyPaidAmount(Billing billing) {
        if (billing.getPaidAmount() == null) {
            billing.setPaidAmount("Paid".equalsIgnoreCase(billing.getPaymentStatus())
                    ? safe(billing.getTotalAmount()) : BigDecimal.ZERO);
        }
    }

    private BigDecimal settledAmount(Billing billing) {
        if (billing.getPaidAmount() != null) return billing.getPaidAmount();
        return "Paid".equalsIgnoreCase(billing.getPaymentStatus()) ? safe(billing.getTotalAmount()) : BigDecimal.ZERO;
    }

    private void refreshPaymentStatus(Billing billing) {
        BigDecimal paid = settledAmount(billing);
        BigDecimal total = safe(billing.getTotalAmount());
        billing.setPaidAmount(paid);
        if (paid.compareTo(total) >= 0 && total.signum() > 0) billing.setPaymentStatus("Paid");
        else if (paid.signum() > 0) billing.setPaymentStatus("Partially Paid");
        else if (billing.getPaymentStatus() == null || "Paid".equalsIgnoreCase(billing.getPaymentStatus())
                || "Partially Paid".equalsIgnoreCase(billing.getPaymentStatus())) billing.setPaymentStatus("Pending");
    }

    private BigDecimal safe(BigDecimal value) { return value == null ? BigDecimal.ZERO : value; }
    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }

    private boolean hasRole(Authentication authentication, String... roles) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> Arrays.asList(roles).contains(authority.getAuthority()));
    }

    private void validateCategoryComposition(Billing billing) {
        if (billing.getItems() == null || billing.getItems().isEmpty()) return;
        boolean hasOther = billing.getItems().stream()
                .anyMatch(item -> !"DOCTOR_VISIT".equalsIgnoreCase(clean(item.getServiceCategory())));
        if (isDoctorVisit(billing) && hasOther) {
            throw new IllegalArgumentException("Doctor Visit fees must be billed separately from Accounts services");
        }
    }

    private String categoryLabel(String value) {
        return switch (value == null ? "" : value.toUpperCase(Locale.ROOT)) {
            case "LABORATORY_TEST" -> "Laboratory Tests";
            case "DOCTOR_VISIT" -> "Doctor Visits";
            case "ADMISSION" -> "Admission";
            case "BED_CABIN" -> "Bed/Cabin Charges";
            case "PHARMACY" -> "Pharmacy";
            default -> "Other Services";
        };
    }
}
