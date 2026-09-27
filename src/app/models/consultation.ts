export interface Consultation {
  id: number;
  consultationId: string;

  patientName: string;
  patientId: string;

  doctorName: string;
  department: string;

  date: string;
  time: string;

  type: string;

  symptoms: string;
  diagnosis: string;
  notes: string;

  prescription: string;

  status: 'Pending' | 'Completed' | 'Cancelled';
}