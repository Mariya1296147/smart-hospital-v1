import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Doctor, DoctorService } from '../../../core/services/doctor.service';

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './doctor-form.component.html',
  styleUrl: './doctor-form.component.css'
})
export class DoctorFormComponent implements OnInit {

  // ================================
  // EDIT MODE
  // ================================

  isEditMode = false;
  doctorId: number | null = null;


  // ================================
  // DOCTOR DATA
  // ================================

  doctor = {
    name: '',
    specialization: '',
    department: '',
    email: '',
    phone: '',
    qualification: '',
    experience: '',
    address: '',
    status: 'Active' as 'Active' | 'Inactive'
  };


  // ================================
  // DEPARTMENTS
  // ================================

  departments = [
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Dermatology',
    'General Medicine',
    'Gynecology',
    'ENT',
    'Ophthalmology'
  ];


  // ================================
  // CONSTRUCTOR
  // ================================

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private doctorService: DoctorService
  ) {}


  // ================================
  // INIT
  // ================================

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    // Edit page হলে id পাওয়া যাবে
    if (id) {

      this.isEditMode = true;
      this.doctorId = Number(id);

      const existingDoctor =
        this.doctorService.getDoctorById(this.doctorId);

      if (existingDoctor) {

        this.doctor = {
          name: existingDoctor.name,
          specialization: existingDoctor.specialization,
          department: existingDoctor.department,
          email: existingDoctor.email,
          phone: existingDoctor.phone,
          qualification: existingDoctor.qualification ?? '',
          experience: existingDoctor.experience ?? '',
          address: existingDoctor.address ?? '',
          status: existingDoctor.status
        };

      } else {

        alert('Doctor not found.');

        this.router.navigate([
          '/admin/doctors'
        ]);

      }

    }

  }


  // ================================
  // SAVE / UPDATE DOCTOR
  // ================================

  saveDoctor(): void {

    // Required field validation
    if (
      !this.doctor.name ||
      !this.doctor.specialization ||
      !this.doctor.department ||
      !this.doctor.email ||
      !this.doctor.phone
    ) {

      alert(
        'Please fill in all required fields.'
      );

      return;
    }


    // ================================
    // UPDATE
    // ================================

    if (
      this.isEditMode &&
      this.doctorId !== null
    ) {

      this.doctorService.updateDoctor(
        this.doctorId,
        this.doctor
      );

      alert(
        'Doctor updated successfully!'
      );

    }


    // ================================
    // ADD
    // ================================

    else {

      this.doctorService.addDoctor(
        this.doctor
      );

      alert(
        'Doctor added successfully!'
      );

    }


    // Back to Doctor List
    this.router.navigate([
      '/admin/doctors'
    ]);

  }


  // ================================
  // CANCEL
  // ================================

  cancel(): void {

    this.router.navigate([
      '/admin/doctors'
    ]);

  }

}