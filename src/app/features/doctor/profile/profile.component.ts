
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor } from '../../../models/doctor';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  doctor: Doctor | null = null;
  loading = true;
  accountName = 'Doctor';
  accountEmail = '';

  constructor(auth: AuthService, doctors: DoctorService) {
    const user = auth.getCurrentUser();
    this.accountEmail = user?.email ?? '';
    this.accountName = `${user?.userFirstName ?? ''} ${user?.userLastName ?? ''}`.trim() || user?.userName || 'Doctor';
    doctors.getMyDoctor().subscribe({
      next: doctor => {
        this.doctor = doctor;
        this.loading = false;
      },
      error: error => {
        console.error('Doctor profile failed to load', error);
        this.loading = false;
      }
    });
  }

  get displayName(): string {
    return this.doctor?.name || this.accountName;
  }
}
