import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PrescriptionService } from '../../core/services/prescription.service';
import { Prescription } from '../../models/prescription';

interface MedicationRow { patientName: string; patientCode: string; date: string; diagnosis: string; medicineName: string; dosage: string; frequency: string; duration: string; instruction: string; }

@Component({ selector: 'app-nurse-medicine', standalone: true, imports: [CommonModule], templateUrl: './nurse-medicine.component.html' })
export class NurseMedicineComponent implements OnInit {
  medications: MedicationRow[] = [];
  loading = true;
  error = '';
  constructor(private readonly prescriptions: PrescriptionService) {}
  ngOnInit(): void {
    this.prescriptions.getPrescriptions().subscribe({
      next: items => { this.medications = this.toRows(items ?? []); this.loading = false; },
      error: error => { this.error = error?.error?.message || 'Prescribed medicines could not be loaded.'; this.loading = false; }
    });
  }
  private toRows(items: Prescription[]): MedicationRow[] {
    return items.flatMap(prescription => (prescription.medicines ?? []).map(medicine => ({
      patientName: prescription.patientName,
      patientCode: prescription.patientCode ?? '',
      date: prescription.date,
      diagnosis: prescription.diagnosis,
      medicineName: medicine.medicineName,
      dosage: medicine.dosage,
      frequency: medicine.frequency,
      duration: medicine.duration,
      instruction: medicine.instruction
    })));
  }
}
