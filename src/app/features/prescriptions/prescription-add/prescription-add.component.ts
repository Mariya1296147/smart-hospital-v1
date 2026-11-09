
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { PrescriptionService } from '../../../core/services/prescription.service';
import { PatientService } from '../../../core/services/patient.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { DepartmentService } from '../../../core/services/department.service';
import { ConsultationService } from '../../../core/services/consultation.service';
import { TestCatalogService } from '../../../core/services/test-catalog.service';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentService } from '../../../core/services/appointment.service';

import { Patient } from '../../../models/patient';
import { Doctor } from '../../../models/doctor';
import { PrescriptionMedicine, TestCatalogItem } from '../../../models/prescription';

interface DepartmentOption {
  id: number;
  departmentName: string;
}

@Component({
  selector: 'app-prescription-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './prescription-add.component.html',
  styleUrl: './prescription-add.component.css'
})
export class PrescriptionAddComponent implements OnInit {

  patients: Patient[] = [];
  doctor: Doctor | null = null;
  departments: DepartmentOption[] = [];
  doctors: Doctor[] = [];
  availableTests: TestCatalogItem[] = [];
  selectedTests: TestCatalogItem[] = [];
  isAdmin = false;

  selectedPatientId: number | null = null;

  patientName = '';
  patientCode = '';
  age: number | null = null;
  gender = '';

  doctorId: number | null = null;
  doctorName = '';
  departmentId: number | null = null;

  diagnosis = '';
  advice = '';
  admissionRequired = false;
  admissionReason = '';

  consultationId: number | null = null;
  isConsultationMode = false;
  isLoadingConsultation = false;
  appointmentId: number | null = null;
  isLoadingAppointment = false;
  appointmentLoadError = false;
  private appointmentContextLoaded = false;
  private appointmentAge: number | null = null;
  private appointmentGender = '';

  medicines: PrescriptionMedicine[] = [
    this.createEmptyMedicine()
  ];

  constructor(
    private prescriptionService: PrescriptionService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private departmentService: DepartmentService,
    private consultationService: ConsultationService,
    private testCatalogService: TestCatalogService,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    const id = this.route.snapshot.queryParamMap.get('consultationId');
    const appointmentId = Number(this.route.snapshot.queryParamMap.get('appointmentId'));

    if (appointmentId > 0 && Number.isFinite(appointmentId)) {
      this.appointmentId = appointmentId;
      this.loadAppointmentContext(appointmentId);
    }

    if (id) {
      this.consultationId = Number(id);
      this.isConsultationMode = true;
    }

    this.loadDepartments();
    this.loadPatients();
    this.loadTests();
    this.isAdmin = this.authService.isAdmin();
    if (this.isAdmin) this.loadDoctors(); else this.loadDoctor();

    if (id) {
      this.loadConsultation();
    }
  }

  private createEmptyMedicine(): PrescriptionMedicine {
    return {
      medicineName: '',
      dosage: '',
      frequency: '1+0+1',
      duration: '',
      instruction: 'After Meal'
    };
  }

  // LOAD PATIENTS
  private loadPatients(): void {

    this.patientService.getPatients().subscribe({

      next: patients => {

        this.patients = patients ?? [];

        const routePatientId =
          this.route.snapshot.paramMap.get('patientId');

        if (routePatientId && !this.isConsultationMode) {

          const patient = this.patients.find(item =>
            item.patientId === routePatientId ||
            String(item.id) === routePatientId
          );

          if (patient) {
            this.setPatient(patient);
          }
        }

        if (this.isConsultationMode) {
          this.syncConsultationPatient();
        }
      },

      error: error => {
        console.error('Patients failed to load', error);
      }
    });
  }

  // LOAD DOCTOR
  private loadDoctor(): void {

    this.doctorService.getMyDoctor().subscribe({

      next: doctor => {

        this.doctor = doctor;

        this.doctorId = doctor.id ?? null;
        this.doctorName = doctor.name ?? '';

        this.setDoctorDepartment(doctor.department);
      },

      error: error => {
        console.error('Doctor profile failed to load', error);
      }
    });
  }

  private loadAppointmentContext(id: number): void {
    this.isLoadingAppointment = true;
    this.appointmentLoadError = false;
    this.appointmentService.getAppointmentById(id).subscribe({
      next: appointment => {
        this.appointmentContextLoaded = true;
        this.appointmentAge = appointment.age ?? null;
        this.appointmentGender = appointment.gender ?? '';

        const patientId = appointment.patient?.id ?? appointment.patientRecordId ?? null;
        this.selectedPatientId = patientId;
        this.patientName = appointment.patient?.name ?? appointment.patientName ?? '';
        this.patientCode = appointment.patient?.patientId ?? '';

        const patient = this.patients.find(item => Number(item.id) === Number(patientId));
        if (patient) this.setPatient(patient);
        else {
          this.age = this.appointmentAge;
          this.gender = this.appointmentGender;
        }

        this.isLoadingAppointment = false;
      },
      error: error => {
        console.error('Appointment information failed to load:', error);
        this.appointmentLoadError = true;
        this.isLoadingAppointment = false;
        alert('Appointment information could not be loaded. Please reopen the prescription from the Doctor Dashboard.');
      }
    });
  }

  private loadDoctors(): void {
    this.doctorService.getDoctors().subscribe({
      next: doctors => this.doctors = doctors ?? [],
      error: error => console.error('Doctors failed to load', error)
    });
  }

  private loadTests(): void {
    this.testCatalogService.getTests().subscribe({
      next: tests => this.availableTests = (tests ?? []).filter(test => test.active),
      error: error => console.error('Test catalog failed to load', error)
    });
  }

  onDoctorChange(): void {
    const selected = this.doctors.find(item => Number(item.id) === Number(this.doctorId));
    this.doctorName = selected?.name ?? '';
    if (selected?.departmentId != null) this.departmentId = selected.departmentId;
  }

  isTestSelected(id?: number): boolean {
    return id != null && this.selectedTests.some(test => test.id === id);
  }

  toggleTest(test: TestCatalogItem, checked: boolean): void {
    this.selectedTests = checked
      ? [...this.selectedTests.filter(item => item.id !== test.id), test]
      : this.selectedTests.filter(item => item.id !== test.id);
  }

  removeTest(id?: number): void {
    this.selectedTests = this.selectedTests.filter(item => item.id !== id);
  }

  // LOAD DEPARTMENTS
  private loadDepartments(): void {

    this.departmentService.getAll().subscribe({

      next: departments => {

        this.departments = (departments ?? []).map(item => ({
          id: item.id,
          departmentName: item.departmentName
        }));

        this.setDepartmentByName(this.doctor?.department ?? '');
      },

      error: error => {
        console.error('Departments failed to load', error);
      }
    });
  }

  // LOAD CONSULTATION
  private loadConsultation(): void {

    if (!this.consultationId) return;

    this.isLoadingConsultation = true;

    this.consultationService
      .getConsultationById(this.consultationId)
      .subscribe({

        next: consultation => {

          this.patientCode = consultation.patientId ?? '';
          this.patientName = consultation.patientName ?? '';

          this.selectedPatientId =
            consultation.patientRecordId ?? null;

          if (consultation.age != null) {
            this.age = Number(consultation.age);
          }

          if (consultation.gender) {
            this.gender = consultation.gender;
          }

          if (consultation.doctorId != null) {
            this.doctorId = consultation.doctorId;
          }

          this.doctorName = consultation.doctorName ?? '';

          this.setDepartmentByName(consultation.department ?? '');

          if (consultation.diagnosis?.trim()) {
            this.diagnosis = consultation.diagnosis;
          }

          this.syncConsultationPatient();

          this.isLoadingConsultation = false;
        },

        error: error => {

          console.error('Consultation failed to load', error);

          this.isLoadingConsultation = false;

          alert('Consultation information could not be loaded.');
        }
      });
  }

  // SYNC CONSULTATION PATIENT
  private syncConsultationPatient(): void {

    if (!this.patientCode && this.selectedPatientId == null) {
      return;
    }

    const patient = this.patients.find(item =>
      item.patientId === this.patientCode ||
      String(item.id) === String(this.selectedPatientId) ||
      String(item.id) === this.patientCode
    );

    if (patient) {
      this.setPatient(patient);
    }
  }

  // SET PATIENT INFORMATION
  private setPatient(patient: Patient): void {

    this.selectedPatientId = patient.id ?? null;

    this.patientName = patient.name ?? '';

    this.patientCode = patient.patientId ?? '';

    this.age = this.appointmentContextLoaded && this.appointmentAge != null
      ? this.appointmentAge
      : patient.age ?? null;

    this.gender = this.appointmentContextLoaded && this.appointmentGender.trim()
      ? this.appointmentGender
      : patient.gender ?? '';
  }

  // DEPARTMENT
  private setDepartmentByName(name: string): void {

    if (!name || !this.departments.length) return;

    const department = this.departments.find(item =>
      item.departmentName.trim().toLowerCase() ===
      name.trim().toLowerCase()
    );

    if (department) {
      this.departmentId = department.id;
    }
  }

  private setDoctorDepartment(departmentName?: string): void {

    if (!departmentName) return;

    this.setDepartmentByName(departmentName);
  }

  // PATIENT CHANGE
  onPatientChange(): void {

    const patient = this.patients.find(
      item => Number(item.id) === Number(this.selectedPatientId)
    );

    if (patient) {

      this.setPatient(patient);

    } else {

      this.patientName = '';
      this.patientCode = '';
      this.age = null;
      this.gender = '';
    }
  }

  // ADD MEDICINE
  addMedicine(): void {
    this.medicines.push(this.createEmptyMedicine());
  }

  // REMOVE MEDICINE
  removeMedicine(index: number): void {

    if (this.medicines.length > 1) {
      this.medicines.splice(index, 1);
    }
  }

  // SAVE PRESCRIPTION
  savePrescription(): void {

    if (this.appointmentId != null && (this.isLoadingAppointment || this.appointmentLoadError)) {
      alert('Wait for the appointment information to load before saving this prescription.');
      return;
    }

    if (
      this.selectedPatientId === null ||
      !this.patientName.trim() ||
      this.doctorId === null ||
      !this.diagnosis.trim() ||
      (this.admissionRequired && !this.admissionReason.trim()) ||
      this.medicines.length === 0 ||
      this.medicines.some(medicine =>
        !medicine.medicineName.trim()
      )
    ) {

      alert('Please fill in all required fields.');

      return;
    }

    const newPrescription = {

      patientId: this.selectedPatientId,

      doctorId: this.doctorId,

      departmentId: this.departmentId,

      consultationId: this.consultationId,

      appointmentId: this.appointmentId,

      patientName: this.patientName,

      age: this.age,

      gender: this.gender,

      doctorName: this.doctorName,

      diagnosis: this.diagnosis,

      admissionRequired: this.admissionRequired,

      admissionReason: this.admissionRequired ? this.admissionReason.trim() : null,

      medicines: this.medicines,

      tests: this.selectedTests.flatMap(test => test.id == null ? [] : [{ catalogTestId: test.id }]),

      advice: this.advice,

      date: new Date().toISOString().slice(0, 10)
    };

    this.prescriptionService.addPrescription(newPrescription).subscribe({

      next: () => {

        alert('Prescription saved successfully.');

        if (this.isConsultationMode) {
          this.router.navigate(['/doctor/consultations']);
        } else {
          this.router.navigate([this.isAdmin ? '/admin/prescriptions' : '/doctor/dashboard']);
        }
      },

      error: error => {

        console.error('Prescription save failed', error);

        alert(error?.error?.message || 'Failed to save prescription.');
      }
    });
  }

  // CANCEL
  cancel(): void {

    if (this.isConsultationMode) {
      this.router.navigate(['/doctor/consultations']);
    } else {
      this.router.navigate([this.isAdmin ? '/admin/prescriptions' : '/doctor/dashboard']);
    }
  }
}
