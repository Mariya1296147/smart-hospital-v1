
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AppointmentService } from '../../../core/services/appointment.service';
import {
  PublicBookingService,
  PublicDepartmentOption,
  PublicDoctorOption
} from '../../../core/services/public-booking.service';

import { ImageService } from '../../../core/services/image.service';

import {
  HospitalSettings,
  HospitalSettingsService
} from '../../../core/services/hospital-settings.service';

import { SafeResourceUrl } from '@angular/platform-browser';

interface HomeDoctor extends PublicDoctorOption {
  image: string;
  status: string;
  department: string;
}

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

  // =========================================
  // APPOINTMENT FORM
  // =========================================

  appointment = {
    patientName: '',
    email: '',
    phone: '',
    age: null as number | null,
    gender: '',
    departmentId: '',
    doctorId: '',
    date: '',
    time: ''
  };

  bookingDepartments: PublicDepartmentOption[] = [];
  bookingDoctors: PublicDoctorOption[] = [];

  bookingDataLoading = true;
  bookingSubmitting = false;

  hospitalSettings: HospitalSettings;
  mapEmbedUrl: SafeResourceUrl | null;

  // =========================================
  // DOCTOR SLIDER
  // =========================================

  doctors: HomeDoctor[] = [];

  currentDoctor = 0;

  private doctorInterval?: ReturnType<typeof setInterval>;

  get visibleDoctors(): HomeDoctor[] {

    if (this.doctors.length === 0) {
      return [];
    }

    const count = Math.min(4, this.doctors.length);

    return Array.from({ length: count }, (_, index) => {

      const doctorIndex =
        (this.currentDoctor + index) % this.doctors.length;

      return this.doctors[doctorIndex];

    });
  }

  get doctorsForBookingDepartment(): PublicDoctorOption[] {

    const departmentId = Number(this.appointment.departmentId);

    return this.bookingDoctors.filter(
      doctor => doctor.departmentId === departmentId
    );
  }

  // =========================================
  // DEPARTMENT ICONS
  // =========================================

  private readonly departmentIcons: Record<string, string> = {

    cardiology: 'bi-heart-pulse-fill',
    neurology: 'bi-activity',
    orthopedics: 'bi-person-walking',
    pediatrics: 'bi-emoji-smile',
    medicine: 'bi-capsule',
    surgery: 'bi-bandaid-fill',
    pulmonology: 'bi-lungs-fill',
    laboratory: 'bi-eyedropper',
    dermatology: 'bi-person',
    gynecology: 'bi-person-hearts',
    ent: 'bi-ear',
    ophthalmology: 'bi-eye-fill'

  };

  get departments(): Array<PublicDepartmentOption & {
    name: string;
    icon: string;
  }> {

    return this.bookingDepartments.map(department => ({

      ...department,

      name: department.departmentName,

      description:
        department.description ||
        'Specialized hospital care from our medical team.',

      icon:
        this.departmentIcons[
          department.departmentName.toLowerCase()
        ] || 'bi-hospital-fill'

    }));
  }

  // =========================================
  // HERO TYPEWRITER ANIMATION
  // =========================================

  typingText = '';

  private phrases: string[] = [
    'Healthcare Made Smarter.',
    'Your Health, Our Priority.',
    'Care That Connects Everyone.',
    'Modern Healthcare Solutions.'
  ];

  private phraseIndex = 0;
  private charIndex = 0;
  private isDeleting = false;

  private typingTimer?: ReturnType<typeof setTimeout>;

  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    private publicBooking: PublicBookingService,
    private appointmentService: AppointmentService,
    private images: ImageService,
    hospitalSettingsService: HospitalSettingsService
  ) {

    this.hospitalSettings = hospitalSettingsService.getSettings();

    this.mapEmbedUrl =
      hospitalSettingsService.getMapEmbedUrl(
        this.hospitalSettings.address
      );

  }

  // =========================================
  // INIT
  // =========================================

  ngOnInit(): void {

    // Start Hero Typing Animation
    this.typeWriter();

    // Load Departments
    this.publicBooking.getDepartments().subscribe({

      next: departments => {

        this.bookingDepartments = departments ?? [];

        this.bookingDataLoading = false;

      },

      error: error => {

        console.error(
          'Booking departments failed to load:',
          error
        );

        this.bookingDataLoading = false;

      }

    });

    // Load Doctors
    this.publicBooking.getDoctors().subscribe({

      next: doctors => {

        this.bookingDoctors = doctors ?? [];

        this.doctors = this.bookingDoctors.map(doctor => ({

          ...doctor,

          image: doctor.imageUrl
            ? this.images.imageSource(doctor.imageUrl)
            : 'assets/sh.jpg',

          status: 'Available',

          department: doctor.departmentName || 'General'

        }));

        this.currentDoctor = 0;

        // Start Doctor Auto Slider
        if (this.doctors.length > 4) {

          this.doctorInterval = setInterval(() => {

            this.nextDoctor();

          }, 3000);

        }

      },

      error: error => {

        console.error(
          'Booking doctors failed to load:',
          error
        );

        this.bookingDoctors = [];
        this.doctors = [];

      }

    });

  }

  // =========================================
  // TYPEWRITER FUNCTION
  // =========================================

  private typeWriter(): void {

    const currentPhrase = this.phrases[this.phraseIndex];

    if (!this.isDeleting) {

      // Write one character at a time
      this.charIndex++;

      this.typingText = currentPhrase.substring(
        0,
        this.charIndex
      );

      // When the complete sentence appears
      if (this.charIndex >= currentPhrase.length) {

        this.isDeleting = true;

        this.typingTimer = setTimeout(() => {

          this.typeWriter();

        }, 1800);

        return;

      }

    } else {

      // Delete one character at a time
      this.charIndex--;

      this.typingText = currentPhrase.substring(
        0,
        this.charIndex
      );

      // When the sentence is completely deleted
      if (this.charIndex <= 0) {

        this.isDeleting = false;

        this.phraseIndex =
          (this.phraseIndex + 1) % this.phrases.length;

      }

    }

    // Typing and deleting speed
    this.typingTimer = setTimeout(

      () => this.typeWriter(),

      this.isDeleting ? 45 : 85

    );

  }

  // =========================================
  // DOCTOR SLIDER FUNCTIONS
  // =========================================

  nextDoctor(): void {

    if (this.doctors.length <= 4) {
      return;
    }

    this.currentDoctor =
      (this.currentDoctor + 1) % this.doctors.length;

  }

  goToDoctor(index: number): void {

    if (this.doctors.length > 0) {

      this.currentDoctor =
        index % this.doctors.length;

    }

  }

  // =========================================
  // DEPARTMENT CAROUSEL
  // =========================================

  scrollDepartments(direction: number): void {

    const container = document.querySelector(
      '.department-carousel'
    ) as HTMLElement | null;

    if (container) {

      container.scrollBy({

        left: direction * 330,

        behavior: 'smooth'

      });

    }

  }

  // =========================================
  // BOOK APPOINTMENT
  // =========================================

  bookAppointment(): void {

    if (
      !this.appointment.patientName ||
      !this.appointment.email ||
      !this.appointment.phone ||
      this.appointment.age == null ||
      this.appointment.age < 0 ||
      !this.appointment.gender ||
      !this.appointment.departmentId ||
      !this.appointment.doctorId ||
      !this.appointment.date ||
      !this.appointment.time
    ) {

      alert('Please fill in all appointment fields.');

      return;

    }

    this.bookingSubmitting = true;

    this.appointmentService.createPublicAppointment({

      patientName: this.appointment.patientName.trim(),

      email: this.appointment.email.trim(),

      phone: this.appointment.phone.trim(),

      age: Number(this.appointment.age),

      gender: this.appointment.gender,

      departmentId: Number(this.appointment.departmentId),

      doctorId: Number(this.appointment.doctorId),

      appointmentDate: this.appointment.date,

      appointmentTime: this.appointment.time,

      message: ''

    }).subscribe({

      next: () => {

        alert('Appointment request submitted successfully!');

        this.appointment = {

          patientName: '',
          email: '',
          phone: '',
          age: null,
          gender: '',
          departmentId: '',
          doctorId: '',
          date: '',
          time: ''

        };

      },

      error: error => {

        console.error(
          'Appointment submission failed:',
          error
        );

        alert(
          error.error?.message ||
          'Appointment request could not be submitted. Please try again.'
        );

        this.bookingSubmitting = false;

      },

      complete: () => {

        this.bookingSubmitting = false;

      }

    });

  }

  // =========================================
  // DEPARTMENT CHANGE
  // =========================================

  onBookingDepartmentChange(): void {

    this.appointment.doctorId = '';

  }

  // =========================================
  // DESTROY - CLEAR TIMERS
  // =========================================

  ngOnDestroy(): void {

    if (this.doctorInterval) {

      clearInterval(this.doctorInterval);

    }

    if (this.typingTimer) {

      clearTimeout(this.typingTimer);

    }

  }

}
