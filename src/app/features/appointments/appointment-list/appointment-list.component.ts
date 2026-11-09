
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../models/appointment';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.css'
})
export class AppointmentListComponent implements OnInit {

  Math = Math;

  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];

  searchText = '';
  selectedStatus = '';

  currentPage = 1;
  pageSize = 5;

  constructor(
    private appointmentService: AppointmentService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  // Role checking
  get isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  get isReceptionist(): boolean {
    return this.authService.hasRole('RECEPTIONIST');
  }

  get isDoctor(): boolean {
    return this.authService.hasRole('DOCTOR');
  }

  get canAddAppointment(): boolean {
    return this.isAdmin || this.isReceptionist;
  }

  get canEditAppointment(): boolean {
    return this.isAdmin || this.isReceptionist;
  }

  get canDeleteAppointment(): boolean {
    return this.isAdmin;
  }

  // Load appointments
  loadAppointments(): void {
    this.appointmentService.getAppointments().subscribe({
      next: appointments => {
        this.appointments = appointments ?? [];
        this.applyFilters();
      },
      error: error => {
        console.error('Error loading appointments:', error);
        this.appointments = [];
        this.applyFilters();
      }
    });
  }

  // Search and filter
  applyFilters(): void {
    const search = this.searchText.toLowerCase().trim();

    this.filteredAppointments = this.appointments.filter(appointment => {

      const matchesSearch =
        (appointment.patientName || '').toLowerCase().includes(search) ||
        (appointment.appointmentId || '').toLowerCase().includes(search) ||
        (appointment.doctorName || '').toLowerCase().includes(search) ||
        (appointment.department || '').toLowerCase().includes(search) ||
        (appointment.patientPhone || '').includes(search);

      const matchesStatus =
        !this.selectedStatus ||
        appointment.status?.toUpperCase() === this.selectedStatus.toUpperCase();

      return matchesSearch && matchesStatus;
    });

    this.currentPage = 1;
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  // Pagination
  get paginatedAppointments(): Appointment[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAppointments.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAppointments.length / this.pageSize);
  }

  get pages(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1
    );
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // View appointment according to role
  viewAppointment(id: number): void {
    if (this.isDoctor) {
      this.router.navigate(['/doctor/appointments/view', id]);
    } else if (this.isReceptionist) {
      this.router.navigate(['/reception/appointments/view', id]);
    } else {
      this.router.navigate(['/admin/appointments/view', id]);
    }
  }

  // Start consultation (Doctor only)
  startConsultation(appointmentId: number): void {
    this.router.navigate(['/doctor/consultations/add'], {
      queryParams: { appointmentId }
    });
  }

  // Confirm appointment (Receptionist only)
  confirmAppointment(id: number): void {
    if (!this.isReceptionist) {
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to confirm this appointment?'
    );

    if (confirmed) {
      this.appointmentService.updateStatus(id, 'SCHEDULED').subscribe({
        next: () => {
          alert('Appointment confirmed successfully!');
          this.loadAppointments();
        },
        error: error => {
          console.error('Failed to confirm appointment:', error);
          alert('Failed to confirm appointment.');
        }
      });
    }
  }

  // Reject appointment (Receptionist only)
  rejectAppointment(id: number): void {
    if (!this.isReceptionist) {
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to reject this appointment?'
    );

    if (confirmed) {
      this.appointmentService.updateStatus(id, 'REJECTED').subscribe({
        next: () => {
          alert('Appointment rejected successfully!');
          this.loadAppointments();
        },
        error: error => {
          console.error('Failed to reject appointment:', error);
          alert('Failed to reject appointment.');
        }
      });
    }
  }

  // Edit appointment
  editAppointment(id: number): void {
    if (!this.canEditAppointment) {
      return;
    }

    const route = this.isReceptionist
      ? '/reception/appointments/edit'
      : '/admin/appointments/edit';

    this.router.navigate([route, id]);
  }

  // Delete appointment (Admin only)
  deleteAppointment(id: number): void {
    if (!this.canDeleteAppointment) {
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to delete this appointment?'
    );

    if (confirmed) {
      this.appointmentService.deleteAppointment(id).subscribe({
        next: () => this.loadAppointments(),
        error: error => console.error('Failed to delete appointment:', error)
      });
    }
  }

  // Appointment status style
  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED':
        return 'status-scheduled';

      case 'PENDING':
        return 'status-pending';

      case 'COMPLETED':
        return 'status-completed';

      case 'CANCELLED':
        return 'status-cancelled';

      case 'REJECTED':
        return 'status-cancelled';

      default:
        return '';
    }
  }
}
