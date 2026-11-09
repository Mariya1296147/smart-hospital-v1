
package com.hospitalCRUD.service;

import com.hospitalCRUD.entity.DashboardDTO;
import com.hospitalCRUD.repository.PatientRepository;
import com.hospitalCRUD.repository.DoctorRepository;
import com.hospitalCRUD.repository.AppointmentRepository;
import com.hospitalCRUD.repository.AdmissionRepository;
import com.hospitalCRUD.repository.BedRepository;
import com.hospitalCRUD.repository.NurseRepository;
import com.hospitalCRUD.repository.DepartmentRepository;
import com.hospitalCRUD.repository.BillingRepository;
import com.hospitalCRUD.repository.DischargeRepository;
import com.hospitalCRUD.repository.ConsultationRepository;
import com.hospitalCRUD.repository.PrescriptionRepository;
import com.hospitalCRUD.repository.LaboratoryRepository;
import com.hospitalCRUD.repository.PharmacyRepository;
import com.hospitalCRUD.entity.AppointmentStatus;
import com.hospitalCRUD.entity.Admission;
import com.hospitalCRUD.entity.Appointment;
import com.hospitalCRUD.entity.Billing;
import com.hospitalCRUD.entity.Laboratory;
import com.hospitalCRUD.entity.Patient;
import com.hospitalCRUD.entity.Prescription;
import com.hospitalCRUD.entity.Nurse;
import com.hospitalCRUD.entity.Bed;
import com.hospitalCRUD.entity.Discharge;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.Objects;
import java.util.HashSet;
import java.util.Set;
import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class DashboardService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final AdmissionRepository admissionRepository;
    private final BedRepository bedRepository;
    private final NurseRepository nurseRepository;
    private final DepartmentRepository departmentRepository;
    private final BillingRepository billingRepository;
    private final BillingService billingService;
    private final DischargeRepository dischargeRepository;
    private final ConsultationRepository consultationRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final PharmacyRepository pharmacyRepository;

    public DashboardDTO getDashboard(Authentication authentication) {

        String role = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .map(authority -> authority.replace("ROLE_", ""))
                .filter(this::isHospitalRole)
                .findFirst()
                .orElse("USER");

        DashboardDTO dto = new DashboardDTO();

        dto.setDashboard(role.toLowerCase() + "-dashboard");
        dto.setUsername(authentication.getName());

        dto.setRoles(
                authentication.getAuthorities()
                        .stream()
                        .map(GrantedAuthority::getAuthority)
                        .toList()
        );

        dto.setMetrics(loadMetricsFor(role, authentication.getName()));

        return dto;
    }

    private Map<String, Object> loadMetrics() {
        var appointments = appointmentRepository.findAll();
        var admissions = admissionRepository.findAll();
        var beds = bedRepository.findAll();
        var bills = billingRepository.findAll().stream()
                .filter(bill -> !billingService.isDoctorVisit(bill)).toList();
        var laboratoryTests = laboratoryRepository.findAll();
        var medicines = pharmacyRepository.findAll();
        var patients = patientRepository.findAll();
        var doctors = doctorRepository.findAll();
        var discharges = dischargeRepository.findAll();
        var prescriptions = prescriptionRepository.findAll();
        LocalDate today = LocalDate.now();

        long appointmentsToday = appointments.stream()
                .filter(item -> Objects.equals(item.getAppointmentDate(), today)).count();
        long newPatientsToday = patients.stream()
                .filter(item -> item.getCreatedAt() != null
                        && Objects.equals(item.getCreatedAt().toLocalDate(), today)).count();
        long prescriptionsToday = prescriptions.stream()
                .filter(item -> Objects.equals(item.getDate(), today)).count();
        long pendingAppointments = appointments.stream()
                .filter(item -> item.getStatus() == AppointmentStatus.PENDING).count();
        long activeAdmissions = admissions.stream()
                .filter(item -> isActive(item.getStatus())).count();
        long availableBeds = beds.stream()
                .filter(item -> "AVAILABLE".equalsIgnoreCase(item.getStatus())).count();
        long occupiedBeds = beds.stream()
                .filter(item -> "OCCUPIED".equalsIgnoreCase(item.getStatus())).count();
        long unpaidInvoices = bills.stream()
                .filter(item -> item.getPaymentStatus() == null
                        || !"PAID".equalsIgnoreCase(item.getPaymentStatus())).count();
        long pendingLabTests = laboratoryTests.stream()
                .filter(item -> item.getStatus() == null
                        || "PENDING".equalsIgnoreCase(item.getStatus())).count();
        long labTestsToday = laboratoryTests.stream()
                .filter(item -> Objects.equals(item.getSampleDate(), today)).count();
        long completedLabTests = laboratoryTests.stream()
                .filter(item -> "COMPLETED".equalsIgnoreCase(item.getStatus())
                        || "READY".equalsIgnoreCase(item.getStatus())).count();
        long lowStockMedicines = medicines.stream()
                .filter(item -> item.getQuantity() != null && item.getQuantity() <= 10).count();
        long activePatients = patients.stream().filter(item -> item.getStatus() != null
                && "ACTIVE".equalsIgnoreCase(item.getStatus())).count();
        long availableDoctors = doctors.stream().filter(item -> item.getStatus() == null
                || "ACTIVE".equalsIgnoreCase(item.getStatus())
                || "AVAILABLE".equalsIgnoreCase(item.getStatus())).count();
        BigDecimal totalRevenue = bills.stream()
                .filter(item -> "PAID".equalsIgnoreCase(item.getPaymentStatus()))
                .map(item -> item.getTotalAmount() == null ? BigDecimal.ZERO : item.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal todayRevenue = bills.stream()
                .filter(item -> Objects.equals(item.getInvoiceDate(), today)
                        && "PAID".equalsIgnoreCase(item.getPaymentStatus()))
                .map(item -> item.getTotalAmount() == null ? BigDecimal.ZERO : item.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long dischargesToday = discharges.stream()
                .filter(item -> Objects.equals(item.getDischargeDate(), today)).count();

        return Map.ofEntries(
                Map.entry("totalPatients", patientRepository.count()),
                Map.entry("activePatients", activePatients),
                Map.entry("totalDoctors", doctorRepository.count()),
                Map.entry("availableDoctors", availableDoctors),
                Map.entry("totalNurses", nurseRepository.count()),
                Map.entry("totalDepartments", departmentRepository.count()),
                Map.entry("totalAppointments", (long) appointments.size()),
                Map.entry("totalConsultations", consultationRepository.count()),
                Map.entry("appointmentsToday", appointmentsToday),
                Map.entry("newPatientsToday", newPatientsToday),
                Map.entry("pendingAppointments", pendingAppointments),
                Map.entry("activeAdmissions", activeAdmissions),
                Map.entry("availableBeds", availableBeds),
                Map.entry("occupiedBeds", occupiedBeds),
                Map.entry("totalBeds", (long) beds.size()),
                Map.entry("totalInvoices", (long) bills.size()),
                Map.entry("totalBills", (long) bills.size()),
                Map.entry("unpaidInvoices", unpaidInvoices),
                Map.entry("totalRevenue", totalRevenue),
                Map.entry("todayRevenue", todayRevenue),
                Map.entry("dischargesToday", dischargesToday),
                Map.entry("pendingLabTests", pendingLabTests),
                Map.entry("totalLabTests", (long) laboratoryTests.size()),
                Map.entry("labTestsToday", labTestsToday),
                Map.entry("completedLabTests", completedLabTests),
                Map.entry("totalMedicines", (long) medicines.size()),
                Map.entry("totalPrescriptions", (long) prescriptions.size()),
                Map.entry("prescriptionsToday", prescriptionsToday),
                Map.entry("lowStockMedicines", lowStockMedicines)
        );
    }

    private Map<String, Object> loadMetricsFor(String role, String email) {
        return switch (role) {
            case "ADMIN" -> loadMetrics();
            case "DOCTOR" -> doctorMetrics(email);
            case "NURSE" -> nurseMetrics(email);
            case "RECEPTIONIST" -> receptionistMetrics();
            case "LABORATORY_STAFF" -> laboratoryMetrics();
            case "PHARMACY_STAFF" -> pharmacyMetrics();
            case "ACCOUNTS_STAFF" -> accountsMetrics();
            case "PATIENT" -> patientMetrics(email);
            default -> Map.of();
        };
    }

    private Map<String, Object> doctorMetrics(String email) {
        List<Appointment> appointments = appointmentRepository.findByDoctor_EmailIgnoreCase(email);
        Set<Long> patients = new HashSet<>();
        Set<Long> newPatients = new HashSet<>();
        long newPatientsToday = 0;
        LocalDate today = LocalDate.now();
        for (Appointment appointment : appointments) {
            Patient patient = appointment.getPatient();
            if (patient == null) continue;
            if (patient.getId() != null) patients.add(patient.getId());
            if (patient.getCreatedAt() != null && patient.getCreatedAt().toLocalDate().equals(today)
                    && patient.getId() != null && newPatients.add(patient.getId())) newPatientsToday++;
        }
        return Map.of(
                "totalPatients", (long) patients.size(),
                "totalConsultations", (long) consultationRepository.findByDoctor_EmailIgnoreCase(email).size(),
                "newPatientsToday", newPatientsToday,
                "appointmentsToday", appointments.stream().filter(a -> Objects.equals(a.getAppointmentDate(), today)).count(),
                "pendingAppointments", appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.PENDING).count()
        );
    }

    private Map<String, Object> nurseMetrics(String email) {
        Nurse nurse = nurseRepository.findByUser_EmailIgnoreCase(email).orElse(null);
        if (nurse == null || nurse.getWardRef() == null) return Map.of(
                "activeAdmissions", 0L, "occupiedBeds", 0L, "availableBeds", 0L, "totalPatients", 0L);
        List<Admission> admissions = admissionRepository.findByWard_Id(nurse.getWardRef().getId());
        List<Bed> beds = bedRepository.findByWard_Id(nurse.getWardRef().getId());
        List<Admission> activeAdmissions = admissions.stream().filter(item -> isActive(item.getStatus())).toList();
        long wardPatients = activeAdmissions.stream()
                .map(Admission::getPatient).filter(Objects::nonNull).map(Patient::getId).distinct().count();
        return Map.of(
                "activeAdmissions", (long) activeAdmissions.size(),
                "occupiedBeds", beds.stream().filter(item -> "OCCUPIED".equalsIgnoreCase(item.getStatus())).count(),
                "availableBeds", beds.stream().filter(item -> "AVAILABLE".equalsIgnoreCase(item.getStatus())).count(),
                "totalPatients", wardPatients);
    }

    private Map<String, Object> receptionistMetrics() {
        Map<String, Object> all = loadMetrics();
        return select(all, "totalPatients", "newPatientsToday", "appointmentsToday",
                "pendingAppointments", "activeAdmissions", "availableBeds");
    }

    private Map<String, Object> laboratoryMetrics() {
        List<Laboratory> tests = laboratoryRepository.findAll();
        LocalDate today = LocalDate.now();
        return Map.of(
                "totalLabTests", (long) tests.size(),
                "labTestsToday", tests.stream().filter(t -> Objects.equals(t.getSampleDate(), today)).count(),
                "pendingLabTests", tests.stream().filter(t -> t.getStatus() == null || "PENDING".equalsIgnoreCase(t.getStatus())).count(),
                "completedLabTests", tests.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()) || "READY".equalsIgnoreCase(t.getStatus())).count());
    }

    private Map<String, Object> pharmacyMetrics() {
        var medicines = pharmacyRepository.findAll();
        var prescriptions = prescriptionRepository.findAll();
        LocalDate today = LocalDate.now();
        return Map.of(
                "totalMedicines", (long) medicines.size(),
                "lowStockMedicines", medicines.stream().filter(m -> m.getQuantity() != null && m.getQuantity() <= 10).count(),
                "totalPrescriptions", (long) prescriptions.size(),
                "prescriptionsToday", prescriptions.stream().filter(p -> Objects.equals(p.getDate(), today)).count());
    }

    private Map<String, Object> accountsMetrics() {
        List<Billing> bills = billingRepository.findAll().stream()
                .filter(bill -> !billingService.isDoctorVisit(bill)).toList();
        LocalDate today = LocalDate.now();
        BigDecimal totalRevenue = bills.stream().filter(b -> "PAID".equalsIgnoreCase(b.getPaymentStatus()))
                .map(b -> b.getTotalAmount() == null ? BigDecimal.ZERO : b.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal todayRevenue = bills.stream().filter(b -> Objects.equals(b.getInvoiceDate(), today)
                        && "PAID".equalsIgnoreCase(b.getPaymentStatus()))
                .map(b -> b.getTotalAmount() == null ? BigDecimal.ZERO : b.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return Map.of(
                "totalBills", (long) bills.size(),
                "totalInvoices", (long) bills.size(),
                "unpaidInvoices", bills.stream().filter(b -> b.getPaymentStatus() == null || !"PAID".equalsIgnoreCase(b.getPaymentStatus())).count(),
                "totalRevenue", totalRevenue,
                "todayRevenue", todayRevenue);
    }

    private Map<String, Object> patientMetrics(String email) {
        List<Appointment> appointments = appointmentRepository.findByPatient_EmailIgnoreCase(email);
        List<Prescription> prescriptions = prescriptionRepository.findByPatient_EmailIgnoreCase(email);
        List<Laboratory> tests = laboratoryRepository.findByPatient_EmailIgnoreCase(email);
        List<Billing> bills = billingRepository.findByPatient_EmailIgnoreCase(email).stream()
                .filter(bill -> !billingService.isDoctorVisit(bill)).toList();
        List<Admission> admissions = admissionRepository.findByPatient_EmailIgnoreCase(email);
        List<Discharge> discharges = dischargeRepository.findByPatient_EmailIgnoreCase(email);
        List<com.hospitalCRUD.entity.Consultation> consultations = consultationRepository.findByPatient_EmailIgnoreCase(email);
        return Map.of(
                "totalAppointments", (long) appointments.size(),
                "upcomingAppointments", appointments.stream().filter(a -> a.getAppointmentDate() != null
                        && !a.getAppointmentDate().isBefore(LocalDate.now())).count(),
                "totalPrescriptions", (long) prescriptions.size(),
                "totalConsultations", (long) consultations.size(),
                "totalLabTests", (long) tests.size(),
                "totalInvoices", (long) bills.size(),
                "unpaidInvoices", bills.stream().filter(b -> b.getPaymentStatus() == null || !"PAID".equalsIgnoreCase(b.getPaymentStatus())).count(),
                "activeAdmissions", admissions.stream().filter(a -> isActive(a.getStatus())).count(),
                "totalDischarges", (long) discharges.size());
    }

    private Map<String, Object> select(Map<String, Object> source, String... keys) {
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        for (String key : keys) result.put(key, source.getOrDefault(key, 0L));
        return Map.copyOf(result);
    }

    private boolean isActive(String status) {
        return status != null && List.of("ADMITTED", "ACTIVE", "IN_PROGRESS")
                .contains(status.trim().toUpperCase());
    }

    public DashboardDTO getAdminDashboard(
            Authentication authentication) {

        DashboardDTO dto = getDashboard(authentication);
        dto.setDashboard("admin-dashboard");

        return dto;
    }

    private boolean isHospitalRole(String role) {
        return List.of(
                "ADMIN",
                "DOCTOR",
                "RECEPTIONIST",
                "NURSE",
                "LABORATORY_STAFF",
                "PHARMACY_STAFF",
                "ACCOUNTS_STAFF",
                "PATIENT"
        ).contains(role);
    }
}
