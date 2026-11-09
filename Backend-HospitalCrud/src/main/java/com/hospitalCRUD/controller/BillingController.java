package com.hospitalCRUD.controller;

import com.hospitalCRUD.entity.Billing;
import com.hospitalCRUD.entity.BillingPayment;
import com.hospitalCRUD.dtos.BillablePrescriptionTestDTO;
import com.hospitalCRUD.dtos.BillingPaymentRequest;
import com.hospitalCRUD.service.BillingService;
import com.hospitalCRUD.service.RecordAccessService;
import com.hospitalCRUD.reports.BillingReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/billings")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;
    private final RecordAccessService recordAccessService;
    private final BillingReportService billingReportService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTS_STAFF','RECEPTIONIST','PATIENT')")
    public List<Billing> getAll(Authentication authentication) {
        return billingService.getVisibleBills(authentication).stream()
                .filter(item -> recordAccessService.canRead(item, authentication)).toList();
    }

    @GetMapping("/prescribed-tests")
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTS_STAFF')")
    public List<BillablePrescriptionTestDTO> getUnbilledPrescriptionTests() {
        return billingService.getUnbilledPrescriptionTests();
    }

    @GetMapping(value = "/{id}/invoice.pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTS_STAFF','RECEPTIONIST','PATIENT')")
    public ResponseEntity<byte[]> getInvoicePdf(@PathVariable Long id, Authentication authentication) {
        Billing billing = billingService.getByIdForRole(id, authentication);
        recordAccessService.requireRead(recordAccessService.canRead(billing, authentication));
        byte[] pdf = billingReportService.generateInvoicePdf(id);
        return pdfResponse(pdf, "invoice-" + billing.getInvoiceId() + ".pdf");
    }

    @GetMapping("/{id}/payments")
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTS_STAFF','RECEPTIONIST','PATIENT')")
    public List<BillingPayment> getPayments(@PathVariable Long id, Authentication authentication) {
        Billing billing = billingService.getByIdForRole(id, authentication);
        recordAccessService.requireRead(recordAccessService.canRead(billing, authentication));
        return billingService.getPayments(id);
    }

    @PostMapping("/{id}/payments")
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTS_STAFF','RECEPTIONIST')")
    public BillingPayment addPayment(@PathVariable Long id, @RequestBody BillingPaymentRequest request, Authentication authentication) {
        billingService.getByIdForRole(id, authentication);
        return billingService.addPayment(id, request);
    }

    @GetMapping(value = "/{id}/payments/{paymentId}/receipt.pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTS_STAFF','RECEPTIONIST','PATIENT')")
    public ResponseEntity<byte[]> getPaymentReceiptPdf(
            @PathVariable Long id,
            @PathVariable Long paymentId,
            Authentication authentication
    ) {
        Billing billing = billingService.getByIdForRole(id, authentication);
        recordAccessService.requireRead(recordAccessService.canRead(billing, authentication));
        BillingPayment payment = billingService.getPayment(id, paymentId);
        byte[] pdf = billingReportService.generatePaymentReceiptPdf(id, paymentId);
        return pdfResponse(pdf, "receipt-" + payment.getReceiptNumber() + ".pdf");
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTS_STAFF','RECEPTIONIST','PATIENT')")
    public Billing getById(@PathVariable Long id, Authentication authentication) {
        Billing item = billingService.getByIdForRole(id, authentication);
        recordAccessService.requireRead(recordAccessService.canRead(item, authentication));
        return item;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTS_STAFF','RECEPTIONIST')")
    public Billing create(@RequestBody Billing billing, Authentication authentication) {
        billingService.requireBillingCategoryAccess(billing, authentication);
        return billingService.create(billing);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTS_STAFF','RECEPTIONIST')")
    public Billing update(
            @PathVariable Long id,
            @RequestBody Billing billing,
            Authentication authentication
    ) {
        billingService.getByIdForRole(id, authentication);
        billingService.requireBillingCategoryAccess(billing, authentication);
        return billingService.update(id, billing);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String delete(@PathVariable Long id, Authentication authentication) {
        billingService.getByIdForRole(id, authentication);
        billingService.delete(id);
        return "Billing deleted successfully";
    }

    private ResponseEntity<byte[]> pdfResponse(byte[] pdf, String filename) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(pdf);
    }
}
