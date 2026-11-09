import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorPatient } from '../../../models/doctor-patient';

@Component({
  selector: 'app-my-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-patients.component.html',
  styleUrl: './my-patients.component.css'
})
export class MyPatientsComponent implements OnInit {
  searchText = '';
  statusFilter = 'All';
  patients: DoctorPatient[] = [];
  loading = false;
  error = '';
  doctorName = 'Doctor';

  constructor(private readonly appointments: AppointmentService, auth: AuthService) {
    const user = auth.getCurrentUser();
    this.doctorName = `${user?.userFirstName ?? ''} ${user?.userLastName ?? ''}`.trim()
      || user?.userName || 'Doctor';
  }

  ngOnInit(): void {
    this.loading = true;
    this.appointments.getMyPatients().subscribe({
      next: patients => {
        this.patients = patients ?? [];
        this.loading = false;
      },
      error: error => {
        console.error('Doctor patient list failed to load:', error);
        this.error = 'Your patient list could not be loaded.';
        this.loading = false;
      }
    });
  }

  get filteredPatients(): DoctorPatient[] {
    const search = this.searchText.trim().toLowerCase();
    return this.patients.filter(patient => {
      const matchesSearch = !search
        || patient.name.toLowerCase().includes(search)
        || patient.id.toLowerCase().includes(search)
        || (patient.phone ?? '').includes(search);
      const matchesStatus = this.statusFilter === 'All' || patient.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  get scheduledPatients(): number {
    return this.patients.filter(patient => ['PENDING', 'SCHEDULED'].includes(patient.status)).length;
  }

  get completedPatients(): number {
    return this.patients.filter(patient => patient.status === 'COMPLETED').length;
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  viewPatient(patient: DoctorPatient): void {
    alert(`Patient: ${patient.name}\nID: ${patient.id}\nAge: ${patient.age ?? '—'}\nDepartment: ${patient.department || '—'}\nLast appointment: ${patient.lastAppointmentDate || '—'}`);
  }
}
