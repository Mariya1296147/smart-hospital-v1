package com.hospitalCRUD.reports;

import com.hospitalCRUD.entity.Prescription;
import com.hospitalCRUD.entity.PrescriptionMedicine;
import com.hospitalCRUD.entity.PrescriptionTest;
import com.hospitalCRUD.entity.Admission;
import com.hospitalCRUD.entity.Patient;
import com.hospitalCRUD.repository.AdmissionRepository;
import com.hospitalCRUD.repository.PrescriptionRepository;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.JREmptyDataSource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import java.io.InputStream;
import java.time.format.DateTimeFormatter;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PrescriptionReportService {

    private final PrescriptionRepository prescriptionRepository;
    private final AdmissionRepository admissionRepository;

    public byte[] generatePrescriptionPdf(Long prescriptionId) {
        try (InputStream template = new ClassPathResource("reports/prescription.jrxml").getInputStream()) {
            Prescription prescription = prescriptionRepository.findById(prescriptionId)
                    .orElseThrow(() -> new IllegalArgumentException("Prescription not found"));
            Patient patient = prescription.getPatient();
            if (patient == null) throw new IllegalArgumentException("Prescription patient was not found");
            Admission admission = admissionRepository.findFirstBySourcePrescription_Id(prescriptionId)
                    .or(() -> admissionRepository.findFirstByPatient_IdAndStatusInOrderByAdmissionDateDesc(
                            patient.getId(), List.of("PENDING", "ADMITTED", "ACTIVE", "IN_PROGRESS")))
                    .orElse(null);
            JasperReport report = JasperCompileManager.compileReport(template);
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("hospitalName", "Smart Hospital");
            parameters.put("prescriptionId", String.valueOf(prescription.getId()));
            parameters.put("prescriptionDate", prescription.getDate() == null
                    ? "" : prescription.getDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
            parameters.put("patientName", patientName(patient));
            parameters.put("patientCode", value(patient.getPatientId()));
            Integer age = prescription.getAge() == null ? patient.getAge() : prescription.getAge();
            if (age == null && patient.getDateOfBirth() != null) {
                age = Period.between(patient.getDateOfBirth(), prescription.getDate() == null
                        ? LocalDate.now() : prescription.getDate()).getYears();
            }
            parameters.put("patientAge", age == null ? "" : age + " years");
            String gender = value(prescription.getGender());
            parameters.put("patientGender", gender.isBlank() ? value(patient.getGender()) : gender);
            parameters.put("admissionSummary", admissionSummary(prescription, admission));
            parameters.put("admissionDetails", admissionDetails(prescription, admission));
            parameters.put("doctorName", value(prescription.getDoctor().getName()));
            parameters.put("departmentName", prescription.getDepartment() == null
                    ? "" : value(prescription.getDepartment().getDepartmentName()));
            parameters.put("diagnosis", value(prescription.getDiagnosis()));
            parameters.put("medicines", java.util.stream.IntStream.range(0, prescription.getMedicines().size())
                    .mapToObj(index -> formatMedicine(index + 1, prescription.getMedicines().get(index)))
                    .collect(Collectors.joining("\n\n")));
            // Catalog prices remain available for billing, but are intentionally excluded from doctor-facing printouts.
            parameters.put("tests", prescription.getTests().stream()
                    .map(this::formatTest).collect(Collectors.joining("\n")));
            parameters.put("advice", value(prescription.getAdvice()));

            JasperPrint filledReport = JasperFillManager.fillReport(report, parameters, new JREmptyDataSource(1));
            return JasperExportManager.exportReportToPdf(filledReport);
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to generate prescription PDF", exception);
        }
    }

    private String patientName(Patient patient) {
        String name = value(patient.getName());
        if (!name.isBlank()) return name;
        return (value(patient.getFirstName()) + " " + value(patient.getLastName())).trim();
    }

    private String admissionSummary(Prescription prescription, Admission admission) {
        boolean requested = Boolean.TRUE.equals(prescription.getAdmissionRequired());
        String admissionLabel = admission != null ? (requested ? "REQUIRED" : "RECORD ON FILE")
                : requested ? "REQUIRED" : "NOT REQUESTED";
        StringBuilder summary = new StringBuilder("ADMISSION: ").append(admissionLabel);
        if (admission != null) {
            if (admission.getAdmissionId() != null && !admission.getAdmissionId().isBlank()) {
                summary.append("   |   NO. ").append(admission.getAdmissionId().trim());
            }
            if (admission.getStatus() != null && !admission.getStatus().isBlank()) {
                summary.append("   |   STATUS: ").append(admission.getStatus().trim());
            }
        } else if (requested) {
            summary.append("   |   REQUEST: NOT REGISTERED");
        }
        return summary.toString();
    }

    private String admissionDetails(Prescription prescription, Admission admission) {
        StringBuilder details = new StringBuilder();
        String reason = value(admission != null && admission.getReason() != null
                ? admission.getReason() : prescription.getAdmissionReason());
        if (!reason.isBlank()) details.append("Reason: ").append(reason);
        if (admission != null && admission.getWard() != null) {
            append(details, "Ward", admission.getWard().getWardName());
        }
        if (admission != null && admission.getBed() != null) {
            String bed = value(admission.getBed().getBedNumber());
            String type = value(admission.getBed().getBedType());
            append(details, type.isBlank() ? "Bed / Cabin" : type, bed);
        }
        return details.length() == 0 ? "No additional admission details" : details.toString();
    }

    private String formatMedicine(int number, PrescriptionMedicine medicine) {
        StringBuilder line = new StringBuilder().append(number).append(". ").append(value(medicine.getMedicineName()));
        StringBuilder schedule = new StringBuilder("   ");
        append(schedule, "Dose", medicine.getDosage());
        append(schedule, "Frequency", medicine.getFrequency());
        append(schedule, "Duration", medicine.getDuration());
        if (schedule.length() > 3) line.append('\n').append(schedule);
        if (medicine.getInstruction() != null && !medicine.getInstruction().isBlank()) {
            line.append("\n   Instruction: ").append(medicine.getInstruction().trim());
        }
        return line.toString();
    }

    private String formatTest(PrescriptionTest test) {
        String code = test.getTestCode() == null || test.getTestCode().isBlank()
                ? "" : " (" + test.getTestCode().trim() + ")";
        return value(test.getTestName()) + code;
    }

    private void append(StringBuilder line, String label, String value) {
        if (value != null && !value.isBlank()) {
            if (line.length() > 3) line.append("   |   ");
            line.append(label).append(": ").append(value.trim());
        }
    }

    private String value(String value) {
        return value == null ? "" : value.trim();
    }
}
