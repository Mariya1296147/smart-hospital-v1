package com.hospitalCRUD.service;

import com.hospitalCRUD.entity.Admission;
import com.hospitalCRUD.entity.BaseEntity;
import com.hospitalCRUD.entity.Bed;
import com.hospitalCRUD.entity.Patient;
import com.hospitalCRUD.entity.Prescription;
import com.hospitalCRUD.entity.Ward;
import com.hospitalCRUD.repository.AdmissionRepository;
import com.hospitalCRUD.repository.BedRepository;
import com.hospitalCRUD.repository.DepartmentRepository;
import com.hospitalCRUD.repository.DoctorRepository;
import com.hospitalCRUD.repository.PatientRepository;
import com.hospitalCRUD.repository.NurseRepository;
import com.hospitalCRUD.repository.WardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdmissionServiceTest {

    @Mock private AdmissionRepository admissionRepository;
    @Mock private PatientRepository patientRepository;
    @Mock private DoctorRepository doctorRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private BedRepository bedRepository;
    @Mock private WardRepository wardRepository;
    @Mock private NurseRepository nurseRepository;

    private AdmissionService admissionService;

    @BeforeEach
    void setUp() {
        admissionService = new AdmissionService(admissionRepository, patientRepository, doctorRepository,
                departmentRepository, bedRepository, wardRepository, nurseRepository);
        lenient().when(admissionRepository.save(any(Admission.class))).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(bedRepository.save(any(Bed.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void prescriptionCreatesPendingRequestWithUniqueNumberAndNoBed() {
        Patient patient = new Patient();
        assignId(patient, 4L);
        Prescription prescription = new Prescription();
        assignId(prescription, 9L);
        prescription.setPatient(patient);
        prescription.setAdmissionReason("Requires inpatient observation");

        Admission request = admissionService.createPendingFromPrescription(prescription);

        org.junit.jupiter.api.Assertions.assertTrue(request.getAdmissionId().matches("ADM-[A-F0-9]{12}"));
        assertEquals("PENDING", request.getStatus());
        assertEquals(4L, request.getPatient().getId());
        assertEquals("Requires inpatient observation", request.getReason());
        assertNull(request.getBed());
        assertEquals(prescription, request.getSourcePrescription());
    }

    @Test
    void occupiedBedCannotBeAssignedToAnotherAdmission() {
        Patient patient = new Patient();
        assignId(patient, 4L);
        Bed bed = new Bed();
        assignId(bed, 12L);
        bed.setStatus("OCCUPIED");
        when(patientRepository.findById(4L)).thenReturn(Optional.of(patient));
        when(bedRepository.findLockedById(12L)).thenReturn(Optional.of(bed));

        Admission request = new Admission();
        request.setPatient(patient);
        request.setBed(bed);
        request.setStatus("ADMITTED");

        assertThrows(IllegalStateException.class, () -> admissionService.create(request));
    }

    @Test
    void confirmingAdmissionOccupiesBedAndDischargeMakesItAvailable() {
        Patient patient = new Patient();
        assignId(patient, 4L);
        Ward ward = new Ward();
        assignId(ward, 3L);
        Bed bed = new Bed();
        assignId(bed, 12L);
        bed.setStatus("AVAILABLE");
        bed.setWard(ward);

        Admission pending = new Admission();
        assignId(pending, 22L);
        pending.setAdmissionId("ADM-REQUEST1");
        pending.setPatient(patient);
        pending.setStatus("PENDING");

        when(admissionRepository.findById(22L)).thenReturn(Optional.of(pending));
        when(patientRepository.findById(4L)).thenReturn(Optional.of(patient));
        when(bedRepository.findLockedById(12L)).thenReturn(Optional.of(bed));

        Admission confirmation = new Admission();
        confirmation.setPatient(patient);
        confirmation.setWard(ward);
        confirmation.setBed(bed);
        confirmation.setStatus("ADMITTED");

        Admission admitted = admissionService.update(22L, confirmation);

        assertEquals("ADMITTED", admitted.getStatus());
        assertEquals("OCCUPIED", bed.getStatus());
        assertNotNull(admitted.getAdmissionDate());

        admissionService.discharge(22L, null);

        assertEquals("DISCHARGED", admitted.getStatus());
        assertEquals("AVAILABLE", bed.getStatus());
        assertNotNull(admitted.getDischargeDate());
        verify(admissionRepository, times(2)).save(pending);
    }

    private void assignId(BaseEntity entity, long id) {
        try {
            Field field = BaseEntity.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (ReflectiveOperationException exception) {
            throw new IllegalStateException("Could not set a test entity ID", exception);
        }
    }
}
