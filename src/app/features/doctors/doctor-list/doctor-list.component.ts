
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Doctor, DoctorService } from '../../../core/services/doctor.service';
import { ImageService } from '../../../core/services/image.service';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './doctor-list.component.html',
  styleUrl: './doctor-list.component.css'
})
export class DoctorListComponent implements OnInit {

  doctors: Doctor[] = [];
  isLoading = false;

  constructor(
    private doctorService: DoctorService,
    private images: ImageService
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.isLoading = true;

    this.doctorService.getDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load doctors:', error);
        this.doctors = [];
        this.isLoading = false;
      }
    });
  }

  get activeDoctors(): number {
    return this.doctors.filter(
      doctor => doctor.status === 'Active'
    ).length;
  }

  get inactiveDoctors(): number {
    return this.doctors.filter(
      doctor => doctor.status === 'Inactive'
    ).length;
  }

  imageSource(path?: string): string {
    return this.images.imageSource(path);
  }
deleteDoctor(id: number | undefined): void {
  if (id == null) {
    alert('Doctor ID not found.');
    return;
  }

  const confirmed = confirm(
    'Are you sure you want to delete this doctor?'
  );

  if (!confirmed) {
    return;
  }

  this.doctorService.deleteDoctor(id).subscribe({
    next: () => {
      alert('Doctor deleted successfully!');
      this.loadDoctors();
    },
    error: (error) => {
      console.error('Failed to delete doctor:', error);
      alert('Failed to delete doctor.');
    }
  });
}
  }

