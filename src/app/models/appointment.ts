

export interface Appointment {
  id: number;
  appointmentId: string;

  patientName: string;
  patientPhone: string;

  doctorName: string;
  department: string;

  appointmentDate: string;
  appointmentTime: string;

  reason: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Pending';

  notes: string;
}