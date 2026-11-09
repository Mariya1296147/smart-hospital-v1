
export interface Consultation {
  id: number;
  consultationId: string;

  patientName: string;
  patientId: string;
  patientRecordId?: number | null;
  appointmentRecordId?: number | null;

  age: number;
  gender: 'Male' | 'Female' | 'Other';

  doctorName: string;
  doctorId?: number | null;
  department: string;
  departmentId?: number | null;

  date: string;
  time: string;

  type: string;

  symptoms: string;
  diagnosis: string;
  notes: string;

  status: 'Pending' | 'Completed' | 'Cancelled';
}
