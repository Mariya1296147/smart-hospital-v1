
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../models/patient';
import { DepartmentService } from '../../../core/services/department.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { Department } from '../../../models/department';
import { Doctor } from '../../../models/doctor';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.css'
})
export class PatientFormComponent implements OnInit {

  isEditMode = false;
  patientId: number | null = null;
  isSaving = false;
  departments: Department[] = [];
  doctors: Doctor[] = [];

  patient = {
    firstName: '',
    lastName: '',
    name: '',
    patientId: '',
    gender: '',
    age: 0,
    dateOfBirth: '',
    bloodGroup: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    department: '',
    doctor: '',
    maritalStatus: '',
    allergies: '',
    medicalHistory: '',
    status: 'Active'
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private patientService: PatientService,
    private departmentService: DepartmentService,
    private doctorService: DoctorService
  ) {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.patientId = Number(id);
      this.loadPatient(this.patientId);
    }
  }

  ngOnInit(): void {
    this.departmentService.getAll().subscribe({
      next: items => this.departments = items ?? [],
      error: error => console.error('Departments failed to load', error)
    });
    this.doctorService.getDoctors().subscribe({
      next: items => this.doctors = items ?? [],
      error: error => console.error('Doctors failed to load', error)
    });
  }

  get departmentDoctors(): Doctor[] {
    return this.doctors.filter(doctor =>
      doctor.department?.trim().toLowerCase() === this.patient.department.trim().toLowerCase()
    );
  }

  onDepartmentChange(): void {
    if (!this.departmentDoctors.some(doctor => doctor.name === this.patient.doctor)) {
      this.patient.doctor = '';
    }
  }

  // Load patient for editing
  loadPatient(id: number): void {
    this.patientService.getPatientById(id).subscribe({
      next: (existingPatient: Patient) => {
        const names = existingPatient.name?.split(' ') ?? [];

        this.patient = {
          firstName: existingPatient.firstName || names.shift() || '',
          lastName: existingPatient.lastName || names.join(' '),
          name: existingPatient.name || '',
          patientId: existingPatient.patientId || '',
          gender: existingPatient.gender || '',
          age: existingPatient.age || 0,
          dateOfBirth: existingPatient.dateOfBirth || '',
          bloodGroup: existingPatient.bloodGroup || '',
          phone: existingPatient.phone || '',
          email: existingPatient.email || '',
          address: existingPatient.address || '',
          emergencyContact: existingPatient.emergencyContact || '',
          department: existingPatient.department || '',
          doctor: existingPatient.doctor || '',
          maritalStatus: existingPatient.maritalStatus || '',
          allergies: existingPatient.allergies || '',
          medicalHistory: existingPatient.medicalHistory || '',
          status: existingPatient.status || 'Active'
        };
      },
      error: (error) => {
        console.error('Failed to load patient:', error);
        alert('Patient could not be loaded. Please check the backend.');
      }
    });
  }

  // Save or update patient
  savePatient(): void {
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;

    const firstName = this.patient.firstName.trim();
    const lastName = this.patient.lastName.trim();

    const payload: Partial<Patient> = {
      ...this.patient,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim()
    };

    const request = this.isEditMode && this.patientId !== null
      ? this.patientService.updatePatient(this.patientId, payload)
      : this.patientService.addPatient(payload);

    request.subscribe({
      next: () => {
        alert(
          this.isEditMode
            ? 'Patient updated successfully!'
            : 'Patient added successfully!'
        );

        this.router.navigate(['/admin/patients']);
      },
      error: (error) => {
        console.error('Failed to save patient:', error);
        alert('Patient could not be saved. Check the backend and required fields.');
        this.isSaving = false;
      }
    });
  }

  // Reset form
  resetForm(): void {
    if (this.isEditMode && this.patientId !== null) {
      this.loadPatient(this.patientId);
      return;
    }

    this.patient = {
      firstName: '',
      lastName: '',
      name: '',
      patientId: '',
      gender: '',
      age: 0,
      dateOfBirth: '',
      bloodGroup: '',
      phone: '',
      email: '',
      address: '',
      emergencyContact: '',
      department: '',
      doctor: '',
      maritalStatus: '',
      allergies: '',
      medicalHistory: '',
      status: 'Active'
    };
  }
}
