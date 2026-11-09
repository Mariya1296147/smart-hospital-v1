package com.hospitalCRUD.service;

import com.hospitalCRUD.dtos.PrescriptionDTO;
import com.hospitalCRUD.dtos.PrescriptionMedicineDTO;
import com.hospitalCRUD.entity.Doctor;
import com.hospitalCRUD.entity.Patient;
import com.hospitalCRUD.entity.Prescription;
import com.hospitalCRUD.repository.AppointmentRepository;
import com.hospitalCRUD.repository.BillingItemRepository;
import com.hospitalCRUD.repository.BillingRepository;
import com.hospitalCRUD.repository.ConsultationRepository;
import com.hospitalCRUD.repository.DepartmentRepository;
import com.hospitalCRUD.repository.DoctorRepository;
import com.hospitalCRUD.repository.PatientRepository;
import com.hospitalCRUD.repository.PrescriptionRepository;
import com.hospitalCRUD.repository.TestCatalogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PrescriptionServiceTest {
    @Mock private PrescriptionRepository prescriptionRepository;
    @Mock private PatientRepository patientRepository;
    @Mock private DoctorRepository doctorRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private ConsultationRepository consultationRepository;
    @Mock private AppointmentRepository appointmentRepository;
    @Mock private BillingRepository billingRepository;
    @Mock private BillingItemRepository billingItemRepository;
    @Mock private TestCatalogRepository testCatalogRepository;
    @Mock private RecordAccessService recordAccessService;
    @Mock private AdmissionService admissionService;

    private PrescriptionService prescriptionService;

    @BeforeEach
    void setUp() {
        prescriptionService = new PrescriptionService(prescriptionRepository, patientRepository, doctorRepository,
                departmentRepository, consultationRepository, appointmentRepository, billingRepository,
                billingItemRepository, testCatalogRepository, doctorRepository, recordAccessService, admissionService);
        when(prescriptionRepository.save(any(Prescription.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void createPersistsSubmittedAgeAndGenderAsPrescriptionSnapshot() {
        Patient patient = new Patient();
        patient.setAge(61);
        patient.setGender("Male");
        Doctor doctor = new Doctor();
        doctor.setName("Doctor");
        when(patientRepository.findById(8L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(12L)).thenReturn(Optional.of(doctor));

        PrescriptionDTO request = new PrescriptionDTO();
        request.setPatientId(8L);
        request.setDoctorId(12L);
        request.setAge(35);
        request.setGender("Female");
        request.setDate(LocalDate.of(2026, 11, 6));
        request.setDiagnosis("Test diagnosis");
        request.setMedicines(List.of(new PrescriptionMedicineDTO(null, "Medicine", "1 tablet", "Daily", "5 days", "After meal")));

        PrescriptionDTO saved = prescriptionService.create(request, null);

        ArgumentCaptor<Prescription> persisted = ArgumentCaptor.forClass(Prescription.class);
        verify(prescriptionRepository).save(persisted.capture());
        assertEquals(35, persisted.getValue().getAge());
        assertEquals("Female", persisted.getValue().getGender());
        assertEquals(35, saved.getAge());
        assertEquals("Female", saved.getGender());
    }
}
