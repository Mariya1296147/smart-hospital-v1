import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { DashboardSummary } from '../../../models/dashboard';
import { Appointment } from '../../../models/appointment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  summary: DashboardSummary | null = null;
  appointments: Appointment[] = [];
  loading = true;
  errorMessage = '';

  constructor(private readonly dashboardService: DashboardService, private readonly appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe({
      next: summary => { this.summary = summary; this.loading = false; },
      error: error => { this.errorMessage = error.error?.message || 'Dashboard information could not be loaded.'; this.loading = false; }
    });
    this.appointmentService.getAppointments().subscribe({
      next: items => this.appointments = (items ?? []).slice().sort((a, b) =>
        `${b.appointmentDate} ${b.appointmentTime}`.localeCompare(`${a.appointmentDate} ${a.appointmentTime}`)).slice(0, 5),
      error: error => console.error('Recent appointments failed to load', error)
    });
  }

  metric(name: string): number { return this.summary?.metrics?.[name] ?? 0; }
  patientName(item: Appointment): string { return item.patientName || 'Unknown patient'; }
  patientId(item: Appointment): string { return item.patient?.patientId || ''; }
  doctorName(item: Appointment): string { return item.doctorName || 'Unassigned'; }
  formatTime(value: string): string { return value ? value.slice(0, 5) : '—'; }

}
