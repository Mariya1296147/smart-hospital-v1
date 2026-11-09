
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../models/appointment';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardSummary } from '../../../models/dashboard';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { CompletedDoctorVisit } from '../../../models/prescription';

@Component({
  selector: 'app-reception-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reception-dashboard.component.html',
  styleUrl: './reception-dashboard.component.css'
})
export class ReceptionDashboardComponent implements OnInit {

  appointments: Appointment[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  actionLoadingId: number | null = null;
  summary: DashboardSummary | null = null;
  doctorVisits: CompletedDoctorVisit[] = [];
  doctorVisitsLoading = false;
  doctorVisitsError = '';

  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly dashboardService: DashboardService,
    private readonly prescriptionService: PrescriptionService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.loadDoctorVisits();
    this.dashboardService.getSummary().subscribe({
      next: summary => this.summary = summary,
      error: error => console.error('Dashboard summary failed to load', error)
    });
  }

  metric(name: string): number { return this.summary?.metrics?.[name] ?? 0; }

  loadDoctorVisits(): void {
    this.doctorVisitsLoading = true;
    this.doctorVisitsError = '';
    this.prescriptionService.getCompletedDoctorVisits().subscribe({
      next: visits => {
        this.doctorVisits = visits ?? [];
        this.doctorVisitsLoading = false;
      },
      error: error => {
        console.error('Completed doctor visits failed to load:', error);
        this.doctorVisitsError = 'Completed doctor visits could not be loaded.';
        this.doctorVisitsLoading = false;
      }
    });
  }

  prescriptionSummary(visit: CompletedDoctorVisit): string {
    const prescription = visit.prescription;
    const medicines = (prescription?.medicines ?? []).map(item => {
      const directions = [item.dosage, item.frequency, item.duration, item.instruction]
        .filter(value => !!value?.trim()).join(', ');
      return `${item.medicineName}${directions ? ` (${directions})` : ''}`;
    }).filter(Boolean);
    const tests = (prescription?.tests ?? []).map(item => item.testName).filter(Boolean);
    return [prescription?.diagnosis, medicines.length ? `Medicines: ${medicines.join(', ')}` : '',
      tests.length ? `Tests: ${tests.join(', ')}` : '', prescription?.advice]
      .filter(value => !!value?.trim()).join(' · ') || 'Prescription details unavailable';
  }

  billingParams(visit: CompletedDoctorVisit): Record<string, string | number> {
    return {
      appointmentId: visit.appointmentId,
      appointmentCode: visit.appointmentCode,
      patientId: visit.patientCode,
      patientName: visit.patientName,
      doctor: visit.doctorName,
      department: visit.departmentName ?? '',
      serviceName: `Doctor visit - ${visit.appointmentCode}`
    };
  }

  loadAppointments(): void {
    this.loading = true;
    this.errorMessage = '';

    this.appointmentService.getAppointments().subscribe({
      next: (data) => {
        this.appointments = data.filter(
          appointment =>
            String(appointment.status).toUpperCase() === 'PENDING'
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load appointments:', error);
        this.errorMessage =
          'Appointments could not be loaded. Please check your login and API access.';
        this.loading = false;
      }
    });
  }

  updateAppointmentStatus(
    id: number,
    status: 'SCHEDULED' | 'REJECTED'
  ): void {
    this.actionLoadingId = id;
    this.errorMessage = '';
    this.successMessage = '';

    this.appointmentService.updateStatus(id, status).subscribe({
      next: () => {
        this.successMessage =
          status === 'SCHEDULED'
            ? 'Appointment confirmed successfully.'
            : 'Appointment rejected successfully.';

        this.actionLoadingId = null;
        this.loadAppointments();
      },
      error: (error) => {
        console.error('Failed to update appointment status:', error);
        console.error('Backend response:', error.error);

        this.errorMessage =
          error.error?.message ||
          error.error?.error ||
          `Request failed with status ${error.status}`;

        this.actionLoadingId = null;
      }
    });
  }
}
