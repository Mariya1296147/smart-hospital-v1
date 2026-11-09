package com.hospitalCRUD.reports;

import com.hospitalCRUD.entity.Billing;
import com.hospitalCRUD.entity.BillingItem;
import com.hospitalCRUD.entity.BillingPayment;
import com.hospitalCRUD.repository.BillingPaymentRepository;
import com.hospitalCRUD.repository.BillingRepository;
import lombok.RequiredArgsConstructor;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRMapCollectionDataSource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BillingReportService {

    private final BillingRepository billingRepository;
    private final BillingPaymentRepository billingPaymentRepository;

    public byte[] generateInvoicePdf(Long billingId) {
        Billing billing = billingRepository.findById(billingId)
                .orElseThrow(() -> new IllegalArgumentException("Billing not found"));
        try (InputStream template = new ClassPathResource("reports/billing_invoice.jrxml").getInputStream()) {
            JasperReport report = JasperCompileManager.compileReport(template);
            Map<String, Object> parameters = commonParameters(billing);
            parameters.put("invoiceId", value(billing.getInvoiceId()));
            parameters.put("invoiceDate", billing.getInvoiceDate() == null ? "" : billing.getInvoiceDate().toString());
            parameters.put("subtotal", money(billing.getAmount()));
            parameters.put("discount", money(billing.getDiscount()));
            parameters.put("tax", money(billing.getTax()));
            parameters.put("total", money(billing.getTotalAmount()));
            parameters.put("paidAmount", money(paidAmount(billing)));
            parameters.put("balanceDue", money(money(billing.getTotalAmount()).subtract(paidAmount(billing))));
            parameters.put("paymentStatus", value(billing.getPaymentStatus()));
            JasperPrint filled = JasperFillManager.fillReport(report, parameters, new JRMapCollectionDataSource(invoiceRows(billing)));
            return JasperExportManager.exportReportToPdf(filled);
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to generate billing invoice PDF", exception);
        }
    }

    public byte[] generatePaymentReceiptPdf(Long billingId, Long paymentId) {
        BillingPayment payment = billingPaymentRepository.findByIdAndBilling_Id(paymentId, billingId)
                .orElseThrow(() -> new IllegalArgumentException("Payment receipt not found"));
        Billing billing = payment.getBilling();
        try (InputStream template = new ClassPathResource("reports/payment_receipt.jrxml").getInputStream()) {
            JasperReport report = JasperCompileManager.compileReport(template);
            Map<String, Object> parameters = commonParameters(billing);
            parameters.put("receiptNumber", value(payment.getReceiptNumber()));
            parameters.put("invoiceId", value(billing.getInvoiceId()));
            parameters.put("paymentDate", payment.getPaidAt() == null ? "" : payment.getPaidAt().toString().replace('T', ' '));
            parameters.put("paymentMethod", value(payment.getPaymentMethod()));
            parameters.put("reference", value(payment.getReference()));
            parameters.put("notes", value(payment.getNotes()));
            parameters.put("invoiceTotal", money(billing.getTotalAmount()));
            parameters.put("paymentAmount", money(payment.getAmount()));
            parameters.put("paidToDate", paidAmount(billing));
            parameters.put("balanceDue", money(money(billing.getTotalAmount()).subtract(paidAmount(billing))));
            parameters.put("paymentStatus", value(billing.getPaymentStatus()));
            JasperPrint filled = JasperFillManager.fillReport(report, parameters, new net.sf.jasperreports.engine.JREmptyDataSource(1));
            return JasperExportManager.exportReportToPdf(filled);
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to generate payment receipt PDF", exception);
        }
    }

    private Map<String, Object> commonParameters(Billing billing) {
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("hospitalName", "Smart Hospital");
        parameters.put("patientName", billing.getPatient() == null ? "" : value(billing.getPatient().getName()));
        parameters.put("patientId", billing.getPatient() == null ? "" : value(billing.getPatient().getPatientId()));
        parameters.put("patientPhone", billing.getPatient() == null ? "" : value(billing.getPatient().getPhone()));
        parameters.put("doctorName", billing.getDoctor() == null ? "" : value(billing.getDoctor().getName()));
        parameters.put("departmentName", billing.getDepartment() == null ? "" : value(billing.getDepartment().getDepartmentName()));
        parameters.put("appointmentId", billing.getAppointment() == null ? "" : value(billing.getAppointment().getAppointmentId()));
        return parameters;
    }

    private List<Map<String, ?>> invoiceRows(Billing billing) {
        List<Map<String, ?>> rows = new ArrayList<>();
        if (billing.getItems() != null) {
            for (BillingItem item : billing.getItems()) {
                if (item.getDescription() == null || item.getDescription().isBlank()) continue;
                Map<String, Object> row = new HashMap<>();
                row.put("category", value(item.getServiceCategory()));
                row.put("description", value(item.getDescription()));
                row.put("quantity", item.getQuantity());
                row.put("unitPrice", item.getUnitPrice());
                row.put("lineTotal", item.getLineTotal());
                rows.add(row);
            }
        }
        if (rows.isEmpty() && billing.getServiceName() != null && !billing.getServiceName().isBlank()) {
            Map<String, Object> row = new HashMap<>();
            row.put("category", "");
            row.put("description", billing.getServiceName().trim());
            row.put("quantity", BigDecimal.ONE);
            row.put("unitPrice", money(billing.getAmount()));
            row.put("lineTotal", money(billing.getAmount()));
            rows.add(row);
        }
        return rows;
    }

    private BigDecimal paidAmount(Billing billing) {
        if (billing.getPaidAmount() != null) return billing.getPaidAmount();
        return "Paid".equalsIgnoreCase(billing.getPaymentStatus()) ? money(billing.getTotalAmount()) : BigDecimal.ZERO;
    }

    private BigDecimal money(BigDecimal amount) { return amount == null ? BigDecimal.ZERO : amount; }
    private String value(String value) { return value == null ? "" : value.trim(); }
}
