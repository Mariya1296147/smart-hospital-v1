package com.hospitalCRUD.reports;

import com.hospitalCRUD.entity.Admission;
import com.hospitalCRUD.entity.BaseEntity;
import com.hospitalCRUD.entity.Doctor;
import com.hospitalCRUD.entity.Patient;
import com.hospitalCRUD.entity.Prescription;
import com.hospitalCRUD.repository.AdmissionRepository;
import com.hospitalCRUD.repository.PrescriptionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.parser.PdfTextExtractor;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PrescriptionReportServiceTest {
    @Mock private PrescriptionRepository prescriptionRepository;
    @Mock private AdmissionRepository admissionRepository;
    @InjectMocks private PrescriptionReportService reportService;

    @Test
    void generatesPdfWithPatientAndAdmissionInformation() throws Exception {
        Patient patient = new Patient();
        assignId(patient, 21L);
        patient.setName("Print Test Patient");
        patient.setPatientId("P-PRINT-21");
        patient.setAge(61);
        patient.setDateOfBirth(LocalDate.now().minusYears(61));
        patient.setGender("Male");

        Doctor doctor = new Doctor();
        doctor.setName("Print Test Doctor");

        Prescription prescription = new Prescription();
        assignId(prescription, 77L);
        prescription.setPatient(patient);
        prescription.setDoctor(doctor);
        prescription.setDate(LocalDate.now());
        prescription.setAge(34);
        prescription.setGender("Female");
        prescription.setAdmissionRequired(true);
        prescription.setAdmissionReason("Requires observation");

        Admission admission = new Admission();
        admission.setAdmissionId("ADM-PRINT-77");
        admission.setStatus("PENDING");

        when(prescriptionRepository.findById(77L)).thenReturn(Optional.of(prescription));
        when(admissionRepository.findFirstBySourcePrescription_Id(77L)).thenReturn(Optional.of(admission));
        byte[] pdf = reportService.generatePrescriptionPdf(77L);

        assertTrue(pdf.length > 4);
        assertTrue(new String(pdf, 0, 4, java.nio.charset.StandardCharsets.US_ASCII).startsWith("%PDF"));
        PdfReader reader = new PdfReader(pdf);
        String printedText = new PdfTextExtractor(reader).getTextFromPage(1);
        reader.close();
        assertTrue(printedText.contains("Print Test Patient"));
        assertTrue(printedText.contains("34 years"));
        assertTrue(printedText.contains("Female"));
        assertTrue(printedText.contains("ADM-PRINT-77"));
        assertTrue(printedText.contains("Requires observation"));
    }

    private void assignId(BaseEntity entity, long id) throws Exception {
        Field field = BaseEntity.class.getDeclaredField("id");
        field.setAccessible(true);
        field.set(entity, id);
    }
}
