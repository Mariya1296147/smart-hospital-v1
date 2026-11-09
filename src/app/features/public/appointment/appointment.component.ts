
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment.service';
import { PublicBookingService, PublicDepartmentOption, PublicDoctorOption } from '../../../core/services/public-booking.service';
import { HospitalSettings, HospitalSettingsService } from '../../../core/services/hospital-settings.service';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.css'
})
export class AppointmentComponent implements OnInit {
  readonly hospitalSettings: HospitalSettings;

  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly publicBooking: PublicBookingService,
    hospitalSettingsService: HospitalSettingsService
  ) {
    this.hospitalSettings = hospitalSettingsService.getSettings();
  }

  appointment = {
    patientName: '',
    email: '',
    phone: '',
    age: null as number | null,
    gender: '',
    departmentId: '',
    doctorId: '',
    date: '',
    time: '',
    message: ''
  };

  departments: PublicDepartmentOption[] = [];
  doctors: PublicDoctorOption[] = [];
  loadingDepartments = false;
  loadingDoctors = false;
  submitting = false;
  loadError = '';

  get departmentDoctors(): PublicDoctorOption[] {
    const department = this.departments.find(item => String(item.id) === String(this.appointment.departmentId));
    if (!department) return [];
    return this.doctors.filter(doctor =>
      doctor.departmentId === department.id
    );
  }

  ngOnInit(): void {
    this.loadingDepartments = true;
    this.publicBooking.getDepartments().subscribe({
      next: departments => {
        this.departments = departments ?? [];
        this.loadingDepartments = false;
      },
      error: error => {
        console.error('Departments failed to load:', error);
        this.loadError = 'Departments could not be loaded. Please try again later.';
        this.loadingDepartments = false;
      }
    });
    this.loadingDoctors = true;
    this.publicBooking.getDoctors().subscribe({
      next: doctors => {
        this.doctors = doctors ?? [];
        this.loadingDoctors = false;
      },
      error: error => {
        console.error('Doctors failed to load:', error);
        this.loadError = 'Doctors could not be loaded. Please try again later.';
        this.loadingDoctors = false;
      }
    });
  }

  onDepartmentChange(): void {
    this.appointment.doctorId = '';
  }

  private convertTime(value: string): string {
    const time = value.trim();

    // Already in HH:mm or HH:mm:ss format
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
      return time.length === 5 ? `${time}:00` : time;
    }

    // Supports values such as "10:00 AM - 11:00 AM"
    const match = time.match(
      /(\d{1,2}):(\d{2})\s*(AM|PM)/i
    );

    if (!match) {
      return '';
    }

    let hours = Number(match[1]);
    const minutes = match[2];
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    }

    if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${String(hours).padStart(2, '0')}:${minutes}:00`;
  }

  submitAppointment(): void {
    const doctorId = Number(this.appointment.doctorId);
    const departmentId = Number(this.appointment.departmentId);
    const appointmentTime = this.convertTime(this.appointment.time);

    if (
      !this.appointment.patientName.trim() ||
      !this.appointment.email.trim() ||
      !this.appointment.phone.trim() ||
          this.appointment.age == null ||
          this.appointment.age < 0 ||
          !this.appointment.gender.trim() ||
      !this.appointment.departmentId ||
      !this.appointment.doctorId ||
      !this.appointment.date ||
      !this.appointment.time
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    if (!doctorId || !departmentId) {
      alert('Please select a valid doctor.');
      return;
    }

    if (!appointmentTime) {
      alert('Please select a valid appointment time.');
      return;
    }

    this.submitting = true;
    this.appointmentService.createPublicAppointment({
      patientName: this.appointment.patientName.trim(),
      email: this.appointment.email.trim(),
      phone: this.appointment.phone.trim(),
      age: Number(this.appointment.age),
      gender: this.appointment.gender.trim(),
      doctorId: doctorId,
      departmentId,
      appointmentDate: this.appointment.date,
      appointmentTime: appointmentTime,
      message: this.appointment.message.trim()
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
          time: '',
          message: ''
        };
      },
      error: (error) => {
        console.error('Appointment submission failed:', error);
        this.submitting = false;
        alert(
          error.error?.message ||
          'Appointment submission failed. Please try again.'
        );
      },
      complete: () => this.submitting = false
    });
  }
}
