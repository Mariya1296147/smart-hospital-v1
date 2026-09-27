import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Doctor, DoctorService } from '../../../core/services/doctor.service';

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

  constructor(
    private doctorService: DoctorService
  ) {}

  // ================================
  // LOAD DOCTORS
  // ================================

  ngOnInit(): void {
    this.loadDoctors();
  }


  // ================================
  // GET DOCTORS FROM SERVICE
  // ================================

  loadDoctors(): void {
    this.doctors = this.doctorService.getDoctors();
  }


  // ================================
  // ACTIVE DOCTORS
  // ================================

  get activeDoctors(): number {

    return this.doctors.filter(
      doctor => doctor.status === 'Active'
    ).length;

  }


  // ================================
  // INACTIVE DOCTORS
  // ================================

  get inactiveDoctors(): number {

    return this.doctors.filter(
      doctor => doctor.status === 'Inactive'
    ).length;

  }


  // ================================
  // DELETE DOCTOR
  // ================================

  deleteDoctor(id: number): void {

    const confirmed = confirm(
      'Are you sure you want to delete this doctor?'
    );

    if (!confirmed) {
      return;
    }

    this.doctorService.deleteDoctor(id);

    this.loadDoctors();

  }

}