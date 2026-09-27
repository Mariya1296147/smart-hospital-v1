export interface Discharge {
  id: number;

  dischargeId: string;

  patientName: string;
  patientId: string;

  doctorName: string;
  department: string;

  admissionDate: string;
  dischargeDate: string;

  room: string;
  bed: string;

  dischargeType: string;

  diagnosis: string;
  treatment: string;

  prescription: string;
  instructions: string;

  status: 'Discharged' | 'Pending';
}