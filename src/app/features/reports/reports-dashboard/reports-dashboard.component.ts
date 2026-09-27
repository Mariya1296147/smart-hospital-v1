import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({ selector: 'app-reports-dashboard', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './reports-dashboard.component.html', styleUrl: './reports-dashboard.component.css' })
export class ReportsDashboardComponent {
  range = 'This month';
  reports = [
    { title: 'Patient Report', description: 'Admissions, visits and discharge overview', icon: 'bi-people-fill', color: 'primary', updated: 'Updated today' },
    { title: 'Appointment Report', description: 'Appointments by doctor and status', icon: 'bi-calendar-check-fill', color: 'success', updated: 'Updated today' },
    { title: 'Billing Report', description: 'Invoices, collections and pending payments', icon: 'bi-receipt-cutoff', color: 'warning', updated: 'Updated today' },
    { title: 'Laboratory Report', description: 'Test volume and pending laboratory work', icon: 'bi-eyedropper', color: 'info', updated: 'Updated today' },
    { title: 'Pharmacy Report', description: 'Medicine stock and dispensing summary', icon: 'bi-capsule', color: 'danger', updated: 'Updated today' },
    { title: 'Discharge Report', description: 'Patient discharge activity by department', icon: 'bi-box-arrow-right', color: 'secondary', updated: 'Updated today' }
  ];
  exportReport(title: string): void { alert(`${title} is ready to export for ${this.range}.`); }
}
