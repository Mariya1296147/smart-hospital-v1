import { Injectable } from '@angular/core';
import { Appointment } from '../../models/appointment';


@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private appointments: Appointment[] = [
    {
      id: 1,
      appointmentId: 'APT-1001',
      patientName: 'Rahim Ahmed',
      patientPhone: '01711111111',
      doctorName: 'Dr. Sarah Ahmed',
      department: 'Cardiology',
      appointmentDate: '2026-09-20',
      appointmentTime: '10:00 AM',
      reason: 'Chest Pain',
      status: 'Scheduled',
      notes: 'First consultation'
    },
    {
      id: 2,
      appointmentId: 'APT-1002',
      patientName: 'Nusrat Jahan',
      patientPhone: '01822222222',
      doctorName: 'Dr. Mahmud Hasan',
      department: 'Neurology',
      appointmentDate: '2026-09-20',
      appointmentTime: '11:30 AM',
      reason: 'Headache',
      status: 'Pending',
      notes: 'Morning appointment'
    },
    {
      id: 3,
      appointmentId: 'APT-1003',
      patientName: 'Karim Hossain',
      patientPhone: '01933333333',
      doctorName: 'Dr. Tanvir Rahman',
      department: 'Orthopedics',
      appointmentDate: '2026-09-21',
      appointmentTime: '02:00 PM',
      reason: 'Back Pain',
      status: 'Completed',
      notes: 'Follow-up visit'
    },
    {
      id: 4,
      appointmentId: 'APT-1004',
      patientName: 'Mim Akter',
      patientPhone: '01644444444',
      doctorName: 'Dr. Farzana Islam',
      department: 'Pediatrics',
      appointmentDate: '2026-09-22',
      appointmentTime: '09:30 AM',
      reason: 'Fever',
      status: 'Scheduled',
      notes: 'Child patient'
    },
    {
      id: 5,
      appointmentId: 'APT-1005',
      patientName: 'Sakib Khan',
      patientPhone: '01555555555',
      doctorName: 'Dr. Sarah Ahmed',
      department: 'Cardiology',
      appointmentDate: '2026-09-23',
      appointmentTime: '04:00 PM',
      reason: 'Heart Checkup',
      status: 'Cancelled',
      notes: 'Patient cancelled'
    },
    {
      id: 6,
      appointmentId: 'APT-1006',
      patientName: 'Jannat Ara',
      patientPhone: '01766666666',
      doctorName: 'Dr. Mahmud Hasan',
      department: 'Neurology',
      appointmentDate: '2026-09-24',
      appointmentTime: '12:00 PM',
      reason: 'Migraine',
      status: 'Pending',
      notes: ''
    }
  ];

  getAppointments(): Appointment[] {
    return this.appointments;
  }

  getAppointmentById(id: number): Appointment | undefined {
    return this.appointments.find(
      appointment => appointment.id === id
    );
  }

  addAppointment(appointment: Appointment): void {

    const newId =
      this.appointments.length > 0
        ? Math.max(...this.appointments.map(a => a.id)) + 1
        : 1;

    appointment.id = newId;

    this.appointments.push(appointment);
  }

  updateAppointment(appointment: Appointment): void {

    const index = this.appointments.findIndex(
      a => a.id === appointment.id
    );

    if (index !== -1) {
      this.appointments[index] = appointment;
    }
  }

  deleteAppointment(id: number): void {

    this.appointments =
      this.appointments.filter(
        appointment => appointment.id !== id
      );
  }
}

export { Appointment };
