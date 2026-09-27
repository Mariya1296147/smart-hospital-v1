import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.css'
})
export class AppointmentComponent {

  appointment = {
    patientName: '',
    email: '',
    phone: '',
    department: '',
    doctor: '',
    date: '',
    time: '',
    message: ''
  };

  departments = [
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Dermatology',
    'Gynecology',
    'ENT',
    'Ophthalmology',
    'Pulmonology',
    'General Medicine',
    'Urology',
    'General Surgery'
  ];

  doctors = [
    'Dr. Sarah Ahmed',
    'Dr. Rahim Khan',
    'Dr. Nusrat Jahan',
    'Dr. Tanvir Hasan',
    'Dr. Maria Akter',
    'Dr. Farhan Ahmed'
  ];

  submitAppointment(): void {

    if (
      !this.appointment.patientName ||
      !this.appointment.email ||
      !this.appointment.phone ||
      !this.appointment.department ||
      !this.appointment.doctor ||
      !this.appointment.date ||
      !this.appointment.time
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    alert('Appointment request submitted successfully!');

    this.appointment = {
      patientName: '',
      email: '',
      phone: '',
      department: '',
      doctor: '',
      date: '',
      time: '',
      message: ''
    };
  }

}