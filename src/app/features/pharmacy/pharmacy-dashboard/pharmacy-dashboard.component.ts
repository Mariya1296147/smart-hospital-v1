
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardSummary } from '../../../models/dashboard';
import { PharmacyService } from '../../../core/services/pharmacy.service';
import { Pharmacy } from '../../../models/Pharmacy';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { Prescription } from '../../../models/prescription';

@Component({
  selector: 'app-pharmacy-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pharmacy-dashboard.component.html',
  styleUrl: './pharmacy-dashboard.component.css'
})
export class PharmacyDashboardComponent {
  summary: DashboardSummary | null = null;
  medicines: Pharmacy[] = [];
  prescriptions: Prescription[] = [];
  constructor(dashboard: DashboardService, pharmacy: PharmacyService, prescriptions: PrescriptionService) {
    dashboard.getSummary().subscribe({ next: value => this.summary = value, error: error => console.error('Dashboard summary failed to load', error) });
    pharmacy.getMedicines().subscribe({ next: items => this.medicines = (items ?? []).slice().sort((a, b) => a.quantity - b.quantity).slice(0, 4), error: error => console.error('Medicine stock failed to load', error) });
    prescriptions.getPrescriptions().subscribe({
      next: items => this.prescriptions = (items ?? []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 3),
      error: error => console.error('Recent prescriptions failed to load', error)
    });
  }
  metric(name: string): number { return this.summary?.metrics?.[name] ?? 0; }

  get lowStockMedicines(): Pharmacy[] {
    return this.medicines.filter(medicine => medicine.quantity <= (medicine.lowStockThreshold ?? 10));
  }

}
