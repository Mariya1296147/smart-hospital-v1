import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicBookingService, PublicDoctorOption } from '../../../core/services/public-booking.service';
import { ImageService } from '../../../core/services/image.service';

interface PublicDoctorCard extends PublicDoctorOption {
  image: string;
  specialty: string;
  department: string;
  experienceLabel: string;
}

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.css'
})
export class DoctorsComponent implements OnInit {
  doctors: PublicDoctorCard[] = [];
  loading = true;
  error = '';

  constructor(private readonly booking: PublicBookingService, private readonly images: ImageService) {}

  ngOnInit(): void {
    this.booking.getDoctors().subscribe({
      next: doctors => {
        this.doctors = (doctors ?? []).map(doctor => ({
          ...doctor,
          image: doctor.imageUrl ? this.images.imageSource(doctor.imageUrl) : 'assets/sh.jpg',
          specialty: doctor.specialization || 'Medical Doctor',
          department: doctor.departmentName || 'General',
          experienceLabel: doctor.experience || 'Experienced Doctor'
        }));
        this.loading = false;
      },
      error: error => {
        console.error('Public doctor list failed to load:', error);
        this.error = 'Doctor information is temporarily unavailable.';
        this.loading = false;
      }
    });
  }
}
