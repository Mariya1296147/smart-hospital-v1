
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../models/patient';

@Component({
  selector: 'app-patient-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './patient-view.component.html',
  styleUrl: './patient-view.component.css'
})
export class PatientViewComponent implements OnInit {

  patient: Patient | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || isNaN(id)) {
      this.errorMessage = 'Invalid Patient ID';
      this.isLoading = false;
      return;
    }

    this.patientService.getPatientById(id).subscribe({
      next: (patient: Patient) => {
        this.patient = patient;
        this.isLoading = false;
      },
      error: error => {
        console.error('Patient loading failed:', error);
        this.errorMessage = 'Patient information could not be loaded.';
        this.isLoading = false;
      }
    });
  }

  get patientName(): string {
    if (!this.patient) return 'N/A';

    return this.patient.name ||
      `${this.patient.firstName || ''} ${this.patient.lastName || ''}`.trim() ||
      'N/A';
  }
}
