import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-scan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-scan.component.html',
  styleUrl: './patient-scan.component.css'
})
export class PatientScanComponent {

  patientId = '';
  message = '';

  constructor(private router: Router) {}

  searchPatient(): void {
    const id = this.patientId.trim();

    if (!id) {
      this.message = 'Please enter your Patient ID.';
      return;
    }

    // Demo patient ID
    this.router.navigate(['/patient-access', id]);
  }

  startScanner(): void {
    this.message = 'QR Scanner will be connected here.';
  }
}