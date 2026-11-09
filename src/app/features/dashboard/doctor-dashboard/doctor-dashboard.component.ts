
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../models/appointment';
import { UserDTO } from '../../../models/user';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardSummary } from '../../../models/dashboard';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './doctor-dashboard.component.html',
  styleUrl: './doctor-dashboard.component.css'
})
export class DoctorDashboardComponent implements OnInit {

  currentUser: UserDTO | null = null;
  today = new Date();

  appointments: Appointment[] = [];
  loading = false;
  errorMessage = '';
  summary: DashboardSummary | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly appointmentService: AppointmentService,
    private readonly dashboardService: DashboardService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadAppointments();
    this.dashboardService.getSummary().subscribe({
      next: summary => this.summary = summary,
      error: error => console.error('Dashboard summary failed to load', error)
    });
  }

  metric(name: string): number { return this.summary?.metrics?.[name] ?? 0; }

  loadAppointments(): void {
    this.loading = true;
    this.errorMessage = '';

    this.appointmentService.getMyAppointments().subscribe({
      next: (data: Appointment[]) => {
        this.appointments = (data ?? []).filter(
          appointment =>
            String(appointment.status).toUpperCase() === 'SCHEDULED'
        );

        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load the signed-in doctor’s appointments:', error);

        this.errorMessage =
          'Appointments could not be loaded. Please check your login and API access.';

        this.appointments = [];
        this.loading = false;
      }
    });
  }

  getPatientName(appointment: Appointment): string {
    return appointment.patient?.name
      || appointment.patientName
      || 'Unknown Patient';
  }

  getDepartment(appointment: Appointment): string {
    return appointment.department
      || appointment.doctor?.department
      || appointment.doctor?.specialization
      || 'Not specified';
  }

  getPatientInitials(appointment: Appointment): string {
    return this.getPatientName(appointment)
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(name => name.charAt(0).toUpperCase())
      .join('') || 'PT';
  }

  formatAppointmentTime(time: string): string {
    if (!time) {
      return 'Not specified';
    }

    const parts = time.split(':');
    const hour = Number(parts[0]);
    const minute = parts[1] || '00';

    if (Number.isNaN(hour)) {
      return time;
    }

    const suffix = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;

    return `${String(formattedHour).padStart(2, '0')}:${minute} ${suffix}`;
  }
}
