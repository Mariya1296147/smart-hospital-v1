
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { BillingService } from '../../../core/services/billing.service';
import { DashboardSummary } from '../../../models/dashboard';
import { Billing } from '../../../models/billing';

@Component({
  selector: 'app-accounts-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './accounts-dashboard.component.html',
  styleUrl: './accounts-dashboard.component.css'
})
export class AccountsDashboardComponent {
  summary: DashboardSummary | null = null;
  bills: Billing[] = [];

  constructor(dashboard: DashboardService, billing: BillingService) {
    dashboard.getSummary().subscribe({ next: value => this.summary = value, error: error => console.error('Dashboard summary failed to load', error) });
    billing.getBills().subscribe({
      next: items => this.bills = (items ?? []).slice().sort((a, b) => (b.invoiceDate || '').localeCompare(a.invoiceDate || '')).slice(0, 5),
      error: error => console.error('Recent bills failed to load', error)
    });
  }

  metric(name: string): number { return this.summary?.metrics?.[name] ?? 0; }

}
