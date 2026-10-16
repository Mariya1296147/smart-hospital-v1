
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

  appointment = {
    patientName: '',
    phone: '',
    department: '',
    date: ''
  };

  // DoctorService-এর সব Doctor রাখা হবে
  doctors: Doctor[] = [];

  currentDoctor = 0;

  private doctorInterval?: ReturnType<typeof setInterval>;

  // প্রথমে সর্বোচ্চ ৪টি Card দেখাবে।
  // পরের Card-গুলো Auto Slider দিয়ে দেখা যাবে।
  get visibleDoctors(): Doctor[] {
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

  ngOnInit(): void {
    // কোনো Doctor-কে Filter করে বাদ দেওয়া হচ্ছে না
    this.doctors = this.doctorService.getDoctors();

    this.currentDoctor = 0;

    if (this.doctors.length > 4) {
      this.doctorInterval = setInterval(() => {
        this.nextDoctor();
      }, 3000);
    }
  }

  nextDoctor(): void {
    if (this.doctors.length <= 4) {
      return;
    }

    this.currentDoctor =
      (this.currentDoctor + 1) % this.doctors.length;
  }

  goToDoctor(index: number): void {
    if (this.doctors.length > 0) {
      this.currentDoctor = index % this.doctors.length;
    }
  }

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

  bookAppointment(): void {
    if (
      !this.appointment.patientName ||
      !this.appointment.phone ||
      !this.appointment.department ||
      !this.appointment.date
    ) {
      alert('Please fill in all appointment fields.');
      return;
    }

    alert(
      'Appointment request submitted successfully!\n\n' +
      'Patient: ' + this.appointment.patientName +
      '\nDepartment: ' + this.appointment.department +
      '\nDate: ' + this.appointment.date
    );

    this.appointment = {
      patientName: '',
      phone: '',
      department: '',
      date: ''
    };
  }

  ngOnDestroy(): void {
    if (this.doctorInterval) {
      clearInterval(this.doctorInterval);
    }
  }
}
