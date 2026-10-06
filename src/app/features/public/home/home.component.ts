import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Doctor, DoctorService } from '../../../core/services/doctor.service';

@Component({
  selector: 'app-home',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {

  // =========================================================
  // APPOINTMENT
  // =========================================================

  appointment = {
    patientName: '',
    phone: '',
    department: '',
    date: ''
  };

  // =========================================================
  // DOCTORS
  // =========================================================

  doctors: Doctor[] = [];

  // =========================================================
  // DOCTOR AUTO CAROUSEL
  // =========================================================

  currentDoctor: number = 0;

  private doctorInterval?: ReturnType<typeof setInterval>;

  // =========================================================
  // DEPARTMENTS
  // =========================================================

  departments = [

    {
      name: 'Cardiology',
      description: 'Heart Care',
      icon: 'bi-heart-pulse-fill'
    },

    {
      name: 'Neurology',
      description: 'Brain & Nerve Care',
      icon: 'bi-activity'
    },

    {
      name: 'Orthopedics',
      description: 'Bone & Joint Care',
      icon: 'bi-person-walking'
    },

    {
      name: 'Pediatrics',
      description: 'Child Care',
      icon: 'bi-emoji-smile'
    },

    {
      name: 'Medicine',
      description: 'General Medicine',
      icon: 'bi-capsule'
    },

    {
      name: 'Surgery',
      description: 'Surgical Care',
      icon: 'bi-bandaid-fill'
    },

    {
      name: 'Pulmonology',
      description: 'Lung Care',
      icon: 'bi-lungs-fill'
    },

    {
      name: 'Laboratory',
      description: 'Diagnostic Care',
      icon: 'bi-eyedropper'
    },

    {
      name: 'Dermatology',
      description: 'Skin Care',
      icon: 'bi-person'
    },

    {
      name: 'Gynecology',
      description: 'Women Healthcare',
      icon: 'bi-person-hearts'
    },

    {
      name: 'ENT',
      description: 'Ear, Nose & Throat',
      icon: 'bi-ear'
    },

    {
      name: 'Ophthalmology',
      description: 'Eye Care',
      icon: 'bi-eye-fill'
    }

  ];

  constructor(private doctorService: DoctorService) {}

  // =========================================================
  // INITIALIZE
  // =========================================================

  ngOnInit(): void {

    this.doctors = this.doctorService
      .getDoctors()
      .filter(doctor => doctor.status === 'Active');

    if (this.doctors.length < 2) return;

    this.doctorInterval = setInterval(() => {

      this.nextDoctor();

    }, 4500);

  }

  // =========================================================
  // NEXT DOCTOR
  // =========================================================

  nextDoctor(): void {

    if (this.doctors.length < 2) return;

    this.currentDoctor =
      (this.currentDoctor + 1) %
      this.doctors.length;

  }

  // =========================================================
  // DEPARTMENT SCROLL
  // =========================================================

  scrollDepartments(direction: number): void {

    const container =
      document.querySelector(
        '.department-carousel'
      ) as HTMLElement;

    if (container) {

      container.scrollBy({

        left: direction * 330,

        behavior: 'smooth'

      });

    }

  }

  // =========================================================
  // BOOK APPOINTMENT
  // =========================================================

  bookAppointment(): void {

    if (

      !this.appointment.patientName ||
      !this.appointment.phone ||
      !this.appointment.department ||
      !this.appointment.date

    ) {

      alert(
        'Please fill in all appointment fields.'
      );

      return;

    }

    alert(

      'Appointment request submitted successfully!\n\n' +

      'Patient: ' +
      this.appointment.patientName +

      '\nDepartment: ' +
      this.appointment.department +

      '\nDate: ' +
      this.appointment.date

    );

    this.appointment = {

      patientName: '',
      phone: '',
      department: '',
      date: ''

    };

  }

  // =========================================================
  // DESTROY
  // =========================================================

  ngOnDestroy(): void {

    if (this.doctorInterval) {

      clearInterval(
        this.doctorInterval
      );

    }

  }

}