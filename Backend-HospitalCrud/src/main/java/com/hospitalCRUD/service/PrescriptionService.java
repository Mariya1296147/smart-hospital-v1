package com.hospitalCRUD.service;

import com.hospitalCRUD.dtos.PrescriptionDTO;
import com.hospitalCRUD.dtos.PrescriptionMedicineDTO;
import com.hospitalCRUD.dtos.PrescriptionTestDTO;
import com.hospitalCRUD.dtos.CompletedDoctorVisitDTO;
import com.hospitalCRUD.entity.*;
import com.hospitalCRUD.repository.*;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final ConsultationRepository consultationRepository;
    private final AppointmentRepository appointmentRepository;
    private final BillingRepository billingRepository;
    private final BillingItemRepository billingItemRepository;
    private final TestCatalogRepository testCatalogRepository;
    private final DoctorRepository doctors;
    private final RecordAccessService recordAccessService;
    private final AdmissionService admissionService;

    public List<PrescriptionDTO> getAll() {
        return prescriptionRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public Prescription getEntityById(Long id) {
        return findPrescription(id);
    }

    public List<Prescription> getAllEntities() {
        return prescriptionRepository.findAll();
    }

    public PrescriptionDTO getById(Long id) {
        return toDTO(findPrescription(id));
    }

    @Transactional(readOnly = true)
    public List<CompletedDoctorVisitDTO> getCompletedDoctorVisits() {
        List<Prescription> prescriptions = prescriptionRepository.findAll();
        java.util.Map<Long, Prescription> prescriptionByAppointment = new java.util.HashMap<>();
        for (Prescription prescription : prescriptions) {
            Appointment appointment = linkedAppointment(prescription);
            if (appointment == null || appointment.getId() == null) continue;
            prescriptionByAppointment.merge(appointment.getId(), prescription,
                    (first, second) -> first.getId() != null && second.getId() != null
                            && first.getId() > second.getId() ? first : second);
        }

        return appointmentRepository.findByStatusOrderByAppointmentDateDesc(AppointmentStatus.COMPLETED)
                .stream()
                .filter(appointment -> prescriptionByAppointment.containsKey(appointment.getId()))
                .map(appointment -> toDoctorVisit(appointment, prescriptionByAppointment.get(appointment.getId())))
                .toList();
    }

    public PrescriptionDTO create(PrescriptionDTO dto, Authentication authentication) {

        validateAdmissionRequest(dto);

        Prescription prescription = new Prescription();

        if (hasRole(authentication, "DOCTOR") && !hasRole(authentication, "ADMIN")) {
            Doctor doctor = doctors.findFirstByEmailIgnoreCase(authentication.getName())
                    .orElseThrow(() -> new AccessDeniedException("Doctor profile is not linked to this account"));
            Patient patient = dto.getPatientId() == null ? null : patientRepository.findById(dto.getPatientId()).orElse(null);
            if (patient == null) throw new IllegalArgumentException("Patient not found");
            recordAccessService.requireRead(recordAccessService.canReadPatient(patient, authentication));
            dto.setDoctorId(doctor.getId());
        }

        setReferences(prescription, dto);

        prescription.setDiagnosis(dto.getDiagnosis());
        prescription.setAdvice(dto.getAdvice());
        prescription.setAdmissionRequired(Boolean.TRUE.equals(dto.getAdmissionRequired()));
        prescription.setAdmissionReason(clean(dto.getAdmissionReason()));

        prescription.setDate(
                dto.getDate() != null ? dto.getDate() : LocalDate.now()
        );
        setPatientDemographics(prescription, dto, true);

        addMedicines(prescription, dto.getMedicines());
        addTests(prescription, dto.getTests(), false);

        Prescription saved = prescriptionRepository.save(prescription);
        if (Boolean.TRUE.equals(saved.getAdmissionRequired())) admissionService.createPendingFromPrescription(saved);
        return toDTO(saved);
    }

    public PrescriptionDTO update(Long id, PrescriptionDTO dto) {

        Prescription existing = findPrescription(id);
        Long previousPatientId = existing.getPatient() == null ? null : existing.getPatient().getId();

        setReferences(existing, dto);
        boolean patientChanged = previousPatientId == null
                || !previousPatientId.equals(existing.getPatient().getId());

        existing.setDiagnosis(dto.getDiagnosis());
        existing.setAdvice(dto.getAdvice());
        validateAdmissionRequest(dto);
        if (dto.getAdmissionRequired() != null) {
            existing.setAdmissionRequired(dto.getAdmissionRequired());
            existing.setAdmissionReason(Boolean.TRUE.equals(dto.getAdmissionRequired()) ? clean(dto.getAdmissionReason()) : null);
        } else if (dto.getAdmissionReason() != null) {
            existing.setAdmissionReason(clean(dto.getAdmissionReason()));
        }

        if (dto.getDate() != null) {
            existing.setDate(dto.getDate());
        }
        setPatientDemographics(existing, dto, patientChanged);

        existing.getMedicines().clear();

        addMedicines(existing, dto.getMedicines());
        syncTests(existing, dto.getTests());

        Prescription saved = prescriptionRepository.save(existing);
        if (Boolean.TRUE.equals(saved.getAdmissionRequired())) admissionService.createPendingFromPrescription(saved);
        return toDTO(saved);
    }

    public void delete(Long id) {
        Prescription prescription = findPrescription(id);
        prescriptionRepository.delete(prescription);
    }

    private Prescription findPrescription(Long id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Prescription not found"));
    }

    private void setReferences(
            Prescription prescription,
            PrescriptionDTO dto
    ) {

        Long patientId = dto.getPatientId() != null ? dto.getPatientId()
                : dto.getPatient() == null ? null : dto.getPatient().getId();
        Long doctorId = dto.getDoctorId() != null ? dto.getDoctorId()
                : dto.getDoctor() == null ? null : dto.getDoctor().getId();
        Long departmentId = dto.getDepartmentId() != null ? dto.getDepartmentId()
                : dto.getDepartment() == null ? null : dto.getDepartment().getId();

        if (patientId == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }

        if (doctorId == null) {
            throw new IllegalArgumentException("Doctor ID is required");
        }

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Patient not found"));

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Doctor not found"));

        prescription.setPatient(patient);
        prescription.setDoctor(doctor);

        if (departmentId != null) {

            Department department = departmentRepository
                    .findById(departmentId)
                    .orElseThrow(() ->
                            new IllegalArgumentException("Department not found"));

            prescription.setDepartment(department);

        } else {
            prescription.setDepartment(doctor.getDepartment());
        }

        Consultation consultation = null;
        if (dto.getConsultationId() != null) {
            consultation = consultationRepository.findById(dto.getConsultationId())
                    .orElseThrow(() -> new IllegalArgumentException("Consultation not found"));
            if (!consultation.getPatient().getId().equals(patient.getId())
                    || !consultation.getDoctor().getId().equals(doctor.getId())) {
                throw new IllegalArgumentException("Prescription must match the consultation patient and doctor");
            }
        }
        prescription.setConsultation(consultation);

        Appointment appointment = null;
        if (dto.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(dto.getAppointmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        } else if (consultation != null && consultation.getAppointment() != null) {
            appointment = consultation.getAppointment();
        } else if (prescription.getAppointment() != null) {
            appointment = prescription.getAppointment();
        }

        if (appointment != null) {
            if (!appointment.getPatient().getId().equals(patient.getId())
                    || !appointment.getDoctor().getId().equals(doctor.getId())) {
                throw new IllegalArgumentException("Prescription must match the appointment patient and doctor");
            }
            if (consultation != null && consultation.getAppointment() != null
                    && !consultation.getAppointment().getId().equals(appointment.getId())) {
                throw new IllegalArgumentException("Prescription appointment must match its consultation");
            }
        }
        prescription.setAppointment(appointment);
    }

    private void setPatientDemographics(Prescription prescription, PrescriptionDTO dto, boolean refreshFromPatient) {
        Patient patient = prescription.getPatient();
        Integer age = dto.getAge();
        if (age != null && (age < 0 || age > 150)) {
            throw new IllegalArgumentException("Patient age must be between 0 and 150");
        }
        if (age != null) {
            prescription.setAge(age);
        } else if (refreshFromPatient || prescription.getAge() == null) {
            age = patient.getAge();
            if (age == null && patient.getDateOfBirth() != null) {
                age = java.time.Period.between(patient.getDateOfBirth(),
                        prescription.getDate() == null ? LocalDate.now() : prescription.getDate()).getYears();
            }
            prescription.setAge(age);
        }

        String gender = clean(dto.getGender());
        if (gender != null) {
            prescription.setGender(gender);
        } else if (refreshFromPatient || prescription.getGender() == null) {
            prescription.setGender(clean(patient.getGender()));
        }
    }

    private void addMedicines(
            Prescription prescription,
            List<PrescriptionMedicineDTO> medicineDTOs
    ) {

        if (medicineDTOs == null || medicineDTOs.isEmpty()) {
            throw new IllegalArgumentException(
                    "At least one medicine is required"
            );
        }

        for (PrescriptionMedicineDTO dto : medicineDTOs) {

            if (dto.getMedicineName() == null ||
                    dto.getMedicineName().isBlank()) {
                throw new IllegalArgumentException(
                        "Medicine name is required"
                );
            }

            PrescriptionMedicine medicine = new PrescriptionMedicine();

            medicine.setMedicineName(dto.getMedicineName().trim());

            // Pharmacy relation এখন Optional।
            // Doctor-এর Prescription save করতে Pharmacy lookup লাগবে না।
            medicine.setPharmacy(null);

            medicine.setDosage(dto.getDosage());
            medicine.setFrequency(dto.getFrequency());
            medicine.setDuration(dto.getDuration());
            medicine.setInstruction(dto.getInstruction());

            prescription.addMedicine(medicine);
        }
    }

    private void addTests(Prescription prescription, List<PrescriptionTestDTO> testDTOs, boolean allowInactive) {
        if (testDTOs == null || testDTOs.isEmpty()) return;
        java.util.Set<Long> selectedIds = new java.util.HashSet<>();
        for (PrescriptionTestDTO dto : testDTOs) {
            if (dto.getCatalogTestId() == null || !selectedIds.add(dto.getCatalogTestId())) {
                throw new IllegalArgumentException("Each selected test must be unique and have a catalog ID");
            }
            TestCatalog test = testCatalogRepository.findById(dto.getCatalogTestId())
                    .orElseThrow(() -> new IllegalArgumentException("Selected test was not found"));
            if (!test.isActive() && !allowInactive) throw new IllegalArgumentException("Inactive tests cannot be added to a prescription");
            PrescriptionTest prescriptionTest = new PrescriptionTest();
            prescriptionTest.setCatalogTest(test);
            prescriptionTest.setTestCode(test.getCode());
            prescriptionTest.setTestName(test.getName());
            prescriptionTest.setPrice(test.getPrice());
            prescription.addTest(prescriptionTest);
        }
    }

    private void syncTests(Prescription prescription, List<PrescriptionTestDTO> testDTOs) {
        List<PrescriptionTestDTO> requested = testDTOs == null ? List.of() : testDTOs;
        java.util.Set<Long> selectedIds = new java.util.HashSet<>();
        for (PrescriptionTestDTO dto : requested) {
            if (dto.getCatalogTestId() == null || !selectedIds.add(dto.getCatalogTestId())) {
                throw new IllegalArgumentException("Each selected test must be unique and have a catalog ID");
            }
        }

        java.util.Map<Long, PrescriptionTest> existingByCatalogId = prescription.getTests().stream()
                .filter(test -> test.getCatalogTest() != null && test.getCatalogTest().getId() != null)
                .collect(java.util.stream.Collectors.toMap(test -> test.getCatalogTest().getId(), test -> test));
        for (PrescriptionTest test : List.copyOf(prescription.getTests())) {
            Long catalogId = test.getCatalogTest() == null ? null : test.getCatalogTest().getId();
            if (catalogId != null && selectedIds.contains(catalogId)) continue;
            boolean hasWorkflowHistory = test.getLaboratoryStatus() != null
                    && !"PENDING".equalsIgnoreCase(test.getLaboratoryStatus());
            if (billingItemRepository.existsByPrescriptionTest_Id(test.getId()) || hasWorkflowHistory
                    || org.springframework.util.StringUtils.hasText(test.getLaboratoryResult())) {
                throw new IllegalArgumentException("A billed or started laboratory test cannot be removed from its prescription");
            }
            prescription.getTests().remove(test);
            test.setPrescription(null);
        }

        for (PrescriptionTestDTO dto : requested) {
            if (existingByCatalogId.containsKey(dto.getCatalogTestId())) continue;
            TestCatalog test = testCatalogRepository.findById(dto.getCatalogTestId())
                    .orElseThrow(() -> new IllegalArgumentException("Selected test was not found"));
            PrescriptionTest prescriptionTest = new PrescriptionTest();
            prescriptionTest.setCatalogTest(test);
            prescriptionTest.setTestCode(test.getCode());
            prescriptionTest.setTestName(test.getName());
            prescriptionTest.setPrice(test.getPrice());
            prescription.addTest(prescriptionTest);
        }
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
    }

    private void validateAdmissionRequest(PrescriptionDTO dto) {
        if (dto != null && Boolean.TRUE.equals(dto.getAdmissionRequired())
                && !org.springframework.util.StringUtils.hasText(dto.getAdmissionReason())) {
            throw new IllegalArgumentException("An admission reason is required when admission is requested");
        }
    }

    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }

    private PrescriptionDTO toDTO(Prescription prescription) {

        List<PrescriptionMedicineDTO> medicines =
                prescription.getMedicines()
                        .stream()
                        .map(medicine -> new PrescriptionMedicineDTO(
                                medicine.getId(),
                                medicine.getMedicineName(),
                                medicine.getDosage(),
                                medicine.getFrequency(),
                                medicine.getDuration(),
                                medicine.getInstruction()
                        ))
                        .toList();

        List<PrescriptionTestDTO> tests = prescription.getTests().stream()
                .map(test -> new PrescriptionTestDTO(test.getId(), test.getCatalogTest().getId(),
                        test.getTestCode(), test.getTestName(), test.getPrice()))
                .toList();

        Appointment appointment = linkedAppointment(prescription);
        return new PrescriptionDTO(
                prescription.getId(),
                prescription.getPatient().getId(),
                prescription.getDoctor().getId(),
                prescription.getDepartment() != null
                        ? prescription.getDepartment().getId() : null,
                prescription.getPatient().getName(),
                prescription.getDoctor().getName(),
                prescription.getDepartment() != null
                        ? prescription.getDepartment().getDepartmentName() : null,
                prescription.getDiagnosis(),
                medicines,
                prescription.getAdvice(),
                prescription.getDate(),
                prescription.getConsultation() == null ? null : prescription.getConsultation().getId(),
                tests,
                null,
                null,
                null,
                appointment == null ? null : appointment.getId(),
                appointment == null ? null : appointment.getStatus(),
                Boolean.TRUE.equals(prescription.getAdmissionRequired()),
                prescription.getAdmissionReason(),
                patientAge(prescription),
                prescription.getGender() == null || prescription.getGender().isBlank()
                        ? prescription.getPatient().getGender() : prescription.getGender(),
                prescription.getPatient().getPatientId()
        );
    }

    private Integer patientAge(Prescription prescription) {
        if (prescription.getAge() != null) return prescription.getAge();
        Patient patient = prescription.getPatient();
        if (patient.getAge() != null) return patient.getAge();
        if (patient.getDateOfBirth() == null) return null;
        return java.time.Period.between(patient.getDateOfBirth(),
                prescription.getDate() == null ? LocalDate.now() : prescription.getDate()).getYears();
    }

    private Appointment linkedAppointment(Prescription prescription) {
        if (prescription.getAppointment() != null) return prescription.getAppointment();
        if (prescription.getConsultation() != null) return prescription.getConsultation().getAppointment();
        return null;
    }

    private CompletedDoctorVisitDTO toDoctorVisit(Appointment appointment, Prescription prescription) {
        return new CompletedDoctorVisitDTO(
                appointment.getId(),
                appointment.getAppointmentId(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime(),
                appointment.getStatus(),
                appointment.getReason(),
                appointment.getNotes(),
                appointment.getAge(),
                appointment.getGender(),
                appointment.getPatient().getId(),
                appointment.getPatient().getPatientId(),
                appointment.getPatient().getName(),
                appointment.getPatient().getPhone(),
                appointment.getDoctor().getName(),
                appointment.getDepartment() != null
                        ? appointment.getDepartment().getDepartmentName()
                        : appointment.getDoctor().getDepartment() == null
                        ? null : appointment.getDoctor().getDepartment().getDepartmentName(),
                toDTO(prescription),
                billingRepository.existsByAppointment_Id(appointment.getId())
        );
    }
}
