
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Consultation } from '../../../models/consultation';
import { ConsultationService } from '../../../core/services/consultation.service';
import { PatientService } from '../../../core/services/patient.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { DepartmentService } from '../../../core/services/department.service';
import { Patient } from '../../../models/patient';
import { Doctor } from '../../../models/doctor';
import { AuthService } from '../../../core/services/auth.service';
import { Department } from '../../../models/department';
import { AppointmentService } from '../../../core/services/appointment.service';

@Component({
  selector: 'app-consultation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './consultation-form.component.html',
  styleUrl: './consultation-form.component.css'
})
export class ConsultationFormComponent implements OnInit {

  isEditMode = false;
  consultationId: number | null = null;

  consultation: Consultation = {
    id: 0,
    consultationId: '',
    patientName: '',
    patientId: '',
    age: 0,
    gender: 'Other',
    doctorName: '',
    doctorId: null,
    department: '',
    date: '',
    time: '',
    type: '',
    symptoms: '',
    diagnosis: '',
    notes: '',
    status: 'Pending'
  };

  patients: Patient[] = [];
  doctors: Doctor[] = [];
  departments: Department[] = [];

  consultationTypes = [
    'New Consultation',
    'Follow-up',
    'Emergency Consultation'
  ];

  constructor(
    private consultationService: ConsultationService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private departmentService: DepartmentService,
    private appointmentService: AppointmentService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.patientService.getPatients().subscribe({
      next: patients => {
        this.patients = patients ?? [];
        this.syncSelectedPatientDetails();
      },
      error: error => console.error('Patients failed to load', error)
    });

    if (this.authService.hasRole('DOCTOR')) {

      this.doctorService.getMyDoctor().subscribe({
        next: doctor => {
          this.consultation.doctorId = doctor.id ?? null;
          this.consultation.doctorName = doctor.name;
          this.consultation.department =
            doctor.department || this.consultation.department;
          this.consultation.departmentId = doctor.departmentId ?? this.consultation.departmentId;
        },
        error: error => console.error('Doctor profile failed to load', error)
      });

    } else {

      this.doctorService.getDoctors().subscribe({
        next: doctors => this.doctors = doctors ?? [],
        error: error => console.error('Doctors failed to load', error)
      });

    }

    this.departmentService.getAll().subscribe({
      next: departments => {
        this.departments = departments ?? [];
        if (this.consultation.departmentId == null && this.consultation.department) {
          this.consultation.departmentId = this.departments.find(item =>
            item.departmentName.toLowerCase() === this.consultation.department.toLowerCase()
          )?.id ?? null;
        }
      },
      error: error => console.error('Departments failed to load', error)
    });

    const id = this.route.snapshot.paramMap.get('id');
    const appointmentId = this.route.snapshot.queryParamMap.get('appointmentId');

    if (appointmentId && !id) {
      this.appointmentService.getAppointmentById(Number(appointmentId)).subscribe({
        next: appointment => {
          this.consultation.appointmentRecordId = appointment.id;
          this.consultation.patientRecordId = appointment.patientRecordId ?? null;
          this.consultation.patientName = appointment.patientName;
          this.consultation.patientId = appointment.patient?.patientId ?? '';
          this.consultation.doctorId = appointment.doctorId ?? null;
          this.consultation.doctorName = appointment.doctorName;
          this.consultation.departmentId = appointment.departmentId ?? null;
          this.consultation.department = appointment.department;
          this.consultation.date = appointment.appointmentDate;
          this.consultation.time = appointment.appointmentTime?.slice(0, 5) ?? '';
          this.consultation.type = 'New Consultation';
          this.syncSelectedPatientDetails();
        },
        error: error => console.error('Appointment could not be loaded', error)
      });
    }

    if (id) {

      this.isEditMode = true;
      this.consultationId = Number(id);

      this.consultationService.getConsultationById(this.consultationId).subscribe({
        next: existing => {
          this.consultation = { ...existing };
          this.syncSelectedPatientDetails();
        },
        error: error => console.error('Consultation load failed', error)
      });

    } else {
      this.generateConsultationId();
    }
  }

  generateConsultationId(): void {
    this.consultation.consultationId = `CON-${Date.now()}`;
  }

  onPatientChange(): void {
    this.syncSelectedPatientDetails();
  }

  private syncSelectedPatientDetails(): void {

    const patient = this.patients.find(
      p => Number(p.id) === Number(this.consultation.patientRecordId)
    );

    if (patient) {
      this.consultation.patientName = patient.name;
      this.consultation.patientId = patient.patientId;
      this.consultation.patientRecordId = patient.id ?? null;
      this.consultation.age = patient.age ?? 0;
      const gender = (patient.gender || 'Other').toLowerCase();

      this.consultation.gender =
        gender === 'male' ? 'Male' :
          gender === 'female' ? 'Female' : 'Other';
    }
  }

  onPatientSelected(patientId: number | null): void {
    this.consultation.patientRecordId = patientId;
    this.syncSelectedPatientDetails();
  }

  onDepartmentSelected(departmentId: number | null): void {
    this.consultation.departmentId = departmentId;
    this.consultation.department = this.departments.find(item => item.id === departmentId)?.departmentName ?? '';
  }

  saveConsultation(): void {

    if (
      !this.consultation.patientName ||
      !this.consultation.patientRecordId ||
      this.consultation.doctorId == null ||
      (!this.authService.hasRole('DOCTOR') && !this.consultation.department) ||
      !this.consultation.date ||
      !this.consultation.time ||
      !this.consultation.type
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    if (this.isEditMode) {

      this.consultationService.updateConsultation(
        this.consultationId!,
        this.consultation
      ).subscribe({
        next: () => {
          alert('Consultation updated successfully');
          this.router.navigate([this.consultationsRoute()]);
        },
        error: error => console.error('Consultation update failed', error)
      });

    } else {

      this.consultationService.addConsultation(this.consultation).subscribe({
        next: saved => {
          alert('Consultation saved successfully');
          const returnToConsultations = () => this.router.navigate([this.consultationsRoute()]);
          if (saved.appointmentRecordId) {
            this.appointmentService.updateStatus(saved.appointmentRecordId, 'COMPLETED').subscribe({
              next: returnToConsultations,
              error: error => {
                console.error('Appointment could not be marked complete', error);
                returnToConsultations();
              }
            });
          } else {
            returnToConsultations();
          }
        },
        error: error => console.error('Consultation save failed', error)
      });

    }
  }

  cancel(): void {
    this.router.navigate([this.consultationsRoute()]);
  }

  private consultationsRoute(): string {
    if (this.authService.hasRole('DOCTOR')) return '/doctor/consultations';
    if (this.authService.hasRole('RECEPTIONIST')) return '/reception/dashboard';
    return '/admin/consultations';
  }
}
