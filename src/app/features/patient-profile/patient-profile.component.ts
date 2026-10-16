
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

interface PatientProfile {
  patientId: string;
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  address: string;
}

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-profile.component.html',
  styleUrl: './patient-profile.component.scss'
})
export class PatientProfileComponent {

  formData = {
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    address: ''
  };

  registeredPatient: PatientProfile | null = null;

  searchPatientId = '';
  scannerMessage = '';
  errorMessage = '';
  isLoading = false;

  registerPatient(form: NgForm): void {
    this.errorMessage = '';
    this.scannerMessage = '';

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    const patientId =
      'PT-' + Date.now().toString().slice(-8);

    // Demo only: Backend API integration is still required.
    this.registeredPatient = {
      patientId,
      name: this.formData.name.trim(),
      phone: this.formData.phone.trim(),
      email: this.formData.email.trim(),
      dateOfBirth: this.formData.dateOfBirth,
      gender: this.formData.gender,
      address: this.formData.address.trim()
    };

    this.searchPatientId = patientId;
  }

  findPatient(): void {
    this.scannerMessage = '';

    if (!this.searchPatientId.trim()) {
      this.scannerMessage = 'Please enter your Patient ID.';
      return;
    }

    // Demo only: searches the current in-memory profile.
    // Replace this with a secured Spring Boot API call.
    if (
      this.registeredPatient &&
      this.registeredPatient.patientId.toLowerCase() ===
        this.searchPatientId.trim().toLowerCase()
    ) {
      return; // The existing profile is already displayed.
    }

    this.scannerMessage =
      'Profile not found in this demo. Connect the backend to search registered patients.';
  }

  backToRegistration(): void {
    this.registeredPatient = null;
    this.scannerMessage = '';
    this.errorMessage = '';
  }
}
