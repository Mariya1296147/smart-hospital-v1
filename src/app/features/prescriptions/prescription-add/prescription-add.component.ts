import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PrescriptionService } from '../../../core/services/prescription.service';

@Component({
  selector: 'app-prescription-add',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './prescription-add.component.html',
  styleUrl: './prescription-add.component.css'
})
export class PrescriptionAddComponent {

  prescription = {
    patientId: '',
    patientName: '',
    age: '',
    doctorName: '',
    department: '',
    diagnosis: '',
    medicineName: '',
    dosage: '',
    frequency: '1+0+1',
    duration: '',
    instruction: 'After Meal',
    advice: ''
  };

  constructor(
    private prescriptionService: PrescriptionService,
    private router: Router
  ) {}

  savePrescription(): void {

    if (
      !this.prescription.patientName ||
      !this.prescription.patientId ||
      !this.prescription.diagnosis ||
      !this.prescription.medicineName
    ) {
      alert('Please fill in the required fields.');
      return;
    }

    const newPrescription = {
      id: Date.now(),
      patientId: this.prescription.patientId,
      patientName: this.prescription.patientName,
      doctorName: this.prescription.doctorName,
      department: this.prescription.department,
      diagnosis: this.prescription.diagnosis,
      medicineName: this.prescription.medicineName,
      dosage: this.prescription.dosage,
      frequency: this.prescription.frequency,
      duration: this.prescription.duration,
      instruction: this.prescription.instruction,
      advice: this.prescription.advice,
      date: new Date().toISOString()
    };

    this.prescriptionService.addPrescription(newPrescription);

    alert('Prescription added successfully!');

    this.router.navigate(['/admin/prescriptions']);
  }

  cancel(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}