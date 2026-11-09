

export interface Appointment {
[x: string]: any|string;
patient: any;
doctor: any;
  id: number;
  patientRecordId?: number;
  doctorId?: number;
  departmentId?: number;
  appointmentId: string;

  patientName: string;
  patientPhone: string;
  age?: number | null;
  gender?: string;

  doctorName: string;
  department: string;

  appointmentDate: string;
  appointmentTime: string;

  reason: string;
 status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'PENDING' | 'REJECTED';

  notes: string;
}
