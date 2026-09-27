export interface Prescription {
  id: number;
  patientId: string;
  patientName: string;
  doctorName: string;
  department: string;
  diagnosis: string;

  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instruction: string;

  advice: string;
  date: string;
}