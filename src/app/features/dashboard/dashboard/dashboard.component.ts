import { Component } from '@angular/core';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardSummary } from '../../../models/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  summary: DashboardSummary | null = null;

  constructor(dashboard: DashboardService) {
    dashboard.getSummary().subscribe({
      next: value => {
        this.summary = value;
        this.stats = [
          { title: 'Total Patients', value: this.metric('totalPatients'), icon: 'bi-people' },
          { title: 'Total Doctors', value: this.metric('totalDoctors'), icon: 'bi-person-badge' },
          { title: "Today's Appointments", value: this.metric('appointmentsToday'), icon: 'bi-calendar-check' },
          { title: 'Admitted Patients', value: this.metric('activeAdmissions'), icon: 'bi-hospital' }
        ];
      },
      error: error => console.error('Dashboard summary failed to load', error)
    });
  }

  metric(name: string): number { return this.summary?.metrics?.[name] ?? 0; }

  stats = [
    {
      title: 'Total Patients',
      value: 0,
      icon: 'bi-people'
    },
    {
      title: 'Total Doctors',
      value: 0,
      icon: 'bi-person-badge'
    },
    {
      title: "Today's Appointments",
      value: 0,
      icon: 'bi-calendar-check'
    },
    {
      title: 'Admitted Patients',
      value: 0,
      icon: 'bi-hospital'
    }
  ];

}
