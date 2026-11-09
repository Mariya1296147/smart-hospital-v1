package com.hospitalCRUD.service;

import com.hospitalCRUD.entity.Consultation;
import com.hospitalCRUD.repository.ConsultationRepository;
import com.hospitalCRUD.repository.PatientRepository;
import com.hospitalCRUD.repository.DoctorRepository;
import com.hospitalCRUD.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final com.hospitalCRUD.repository.AppointmentRepository appointmentRepository;

    public List<Consultation> getAll() {
        return consultationRepository.findAll();
    }

    public Consultation getById(Long id) {
        return consultationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultation not found"));
    }

    public Consultation create(Consultation consultation) {
        linkReferences(consultation);
        return consultationRepository.save(consultation);
    }

    public Consultation update(Long id, Consultation consultation) {
        Consultation existing = getById(id);

        existing.setConsultationId(consultation.getConsultationId());
        existing.setPatient(consultation.getPatient());
        existing.setDoctor(consultation.getDoctor());
        existing.setDepartment(consultation.getDepartment());
        existing.setAppointment(consultation.getAppointment());
        existing.setDate(consultation.getDate());
        existing.setTime(consultation.getTime());
        existing.setType(consultation.getType());
        existing.setSymptoms(consultation.getSymptoms());
        existing.setDiagnosis(consultation.getDiagnosis());
        existing.setNotes(consultation.getNotes());
        existing.setPrescription(consultation.getPrescription());
        existing.setStatus(consultation.getStatus());

        linkReferences(existing);
        return consultationRepository.save(existing);
    }

    public void delete(Long id) {
        consultationRepository.deleteById(id);
    }

    private void linkReferences(Consultation consultation) {
        if (consultation.getPatient() == null || consultation.getPatient().getId() == null) {
            throw new IllegalArgumentException("A valid patient must be selected");
        }
        consultation.setPatient(patientRepository.findById(consultation.getPatient().getId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found")));
        if (consultation.getDoctor() == null || consultation.getDoctor().getId() == null) {
            throw new IllegalArgumentException("A valid doctor must be selected");
        }
        consultation.setDoctor(doctorRepository.findById(consultation.getDoctor().getId())
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found")));
        if (consultation.getDepartment() != null && consultation.getDepartment().getId() != null) {
            consultation.setDepartment(departmentRepository.findById(consultation.getDepartment().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found")));
        } else {
            consultation.setDepartment(consultation.getDoctor().getDepartment());
        }
        if (consultation.getAppointment() != null && consultation.getAppointment().getId() != null) {
            var appointment = appointmentRepository.findById(consultation.getAppointment().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
            if (!appointment.getPatient().getId().equals(consultation.getPatient().getId())
                    || !appointment.getDoctor().getId().equals(consultation.getDoctor().getId())) {
                throw new IllegalArgumentException("Consultation patient and doctor must match the appointment");
            }
            consultation.setAppointment(appointment);
        } else {
            consultation.setAppointment(null);
        }
    }
}
