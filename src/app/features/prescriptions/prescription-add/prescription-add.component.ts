
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PrescriptionService } from '../../../core/services/prescription.service';

@Component({
  selector: 'app-prescription-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
    private router: Router,
    private route: ActivatedRoute
  ) {
    const patientId = this.route.snapshot.paramMap.get('patientId') ?? '';

    const patients: { [key: string]: string } = {
      'P-1001': 'Mariya Rahman',
      'P-1002': 'Sarah Ahmed',
      'P-1003': 'John Smith'
    };

    this.prescription.patientId = patientId;
    this.prescription.patientName = patients[patientId] ?? '';
  }

  savePrescription(): void {
    if (
      !this.prescription.patientName.trim() ||
      !this.prescription.patientId.trim() ||
      !this.prescription.diagnosis.trim() ||
      !this.prescription.medicineName.trim()
    ) {
      alert('Please fill in the required fields.');
      return;
    }

    const newPrescription = {
      ...this.prescription,
      id: Date.now(),
      date: new Date().toISOString()
    };

    this.prescriptionService.addPrescription(newPrescription);

    alert('Prescription added successfully!');
    this.router.navigate(['/doctor/dashboard']);
  }

  cancel(): void {
    this.router.navigate(['/doctor/dashboard']);
  }
}
