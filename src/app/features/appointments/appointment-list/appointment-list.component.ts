
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../models/appointment';

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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointments =
      this.appointmentService.getAppointments();

    this.applyFilters();
  }

  applyFilters(): void {

    const search =
      this.searchText.toLowerCase().trim();

    this.filteredAppointments =
      this.appointments.filter(appointment => {

        const matchesSearch =
          appointment.patientName
            .toLowerCase()
            .includes(search)

          ||

          appointment.appointmentId
            .toLowerCase()
            .includes(search)

          ||

          appointment.doctorName
            .toLowerCase()
            .includes(search)

          ||

          appointment.department
            .toLowerCase()
            .includes(search)

          ||

          appointment.patientPhone
            .includes(search);

        const matchesStatus =
          !this.selectedStatus ||
          appointment.status === this.selectedStatus;

        return matchesSearch && matchesStatus;
      });

    this.currentPage = 1;
  }

  clearFilters(): void {

    this.searchText = '';

    this.selectedStatus = '';

    this.applyFilters();
  }

  get paginatedAppointments(): Appointment[] {

    const start =
      (this.currentPage - 1) * this.pageSize;

    const end =
      start + this.pageSize;

    return this.filteredAppointments.slice(
      start,
      end
    );
  }

  get totalPages(): number {

    return Math.ceil(
      this.filteredAppointments.length /
      this.pageSize
    );
  }

  get pages(): number[] {

    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1
    );
  }

  goToPage(page: number): void {

    if (
      page >= 1 &&
      page <= this.totalPages
    ) {
      this.currentPage = page;
    }
  }

  viewAppointment(id: number): void {

    this.router.navigate([
      '/admin/appointments/view',
      id
    ]);
  }

  editAppointment(id: number): void {

    this.router.navigate([
      '/admin/appointments/edit',
      id
    ]);
  }

  deleteAppointment(id: number): void {

    const confirmed = confirm(
      'Are you sure you want to delete this appointment?'
    );

    if (confirmed) {

      this.appointmentService
        .deleteAppointment(id);

      this.loadAppointments();
    }
  }

  // Admission button
  admitPatient(id: number): void {

    this.router.navigate([
      '/admin/admissions'
    ]);
  }

  getStatusClass(status: string): string {

    switch (status) {

      case 'Scheduled':
        return 'status-scheduled';

      case 'Pending':
        return 'status-pending';

      case 'Completed':
        return 'status-completed';

      case 'Cancelled':
        return 'status-cancelled';

      default:
        return '';
    }
  }
}
