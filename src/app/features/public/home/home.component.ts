import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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

  doctors = [
    {
      name: 'Dr. Sarah Ahmed',
      specialty: 'Cardiologist',
      department: 'Cardiology',
      experience: '12 Years Experience',
      qualification: 'MBBS, FCPS',
      image: 'assets/doctor 4.jpg',
      rating: 4.9
    },

    {
      name: 'Dr. Rahim Khan',
      specialty: 'Neurologist',
      department: 'Neurology',
      experience: '10 Years Experience',
      qualification: 'MBBS, MD',
      image: 'assets/doctor11.jpg',
      rating: 4.8
    },

    {
      name: 'Dr. Nusrat Jahan',
      specialty: 'Pediatrician',
      department: 'Pediatrics',
      experience: '8 Years Experience',
      qualification: 'MBBS, DCH',
      image: 'assets/doctor 9.jpeg',
      rating: 4.9
    },

    {
      name: 'Dr. Tanvir Hasan',
      specialty: 'Orthopedic Surgeon',
      department: 'Orthopedics',
      experience: '11 Years Experience',
      qualification: 'MBBS, MS',
      image: 'assets/doctorss.avif',
      rating: 4.7
    },

    {
      name: 'Dr. Maria Akter',
      specialty: 'Dermatologist',
      department: 'Dermatology',
      experience: '9 Years Experience',
      qualification: 'MBBS, DDV',
      image: 'assets/doctor10.avif',
      rating: 4.8
    },

    {
      name: 'Dr. Farhan Ahmed',
      specialty: 'General Physician',
      department: 'General Medicine',
      experience: '7 Years Experience',
      qualification: 'MBBS, FCPS',
      image: 'assets/images (6).jpg',
      rating: 4.6
    }
  ];

  // =========================================================
  // DOCTOR AUTO CAROUSEL
  // =========================================================

  currentDoctor: number = 0;

  private doctorInterval: any;

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

  // =========================================================
  // INITIALIZE
  // =========================================================

  ngOnInit(): void {

    this.doctorInterval = setInterval(() => {

      this.nextDoctor();

    }, 8000);

  }

  // =========================================================
  // NEXT DOCTOR
  // =========================================================

  nextDoctor(): void {

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