export interface DoctorPatient {
  id: string;
  name: string;
  age: number | null;
  gender?: string;
  bloodGroup?: string;
  phone?: string;
  department?: string;
  status: string;
  lastAppointmentDate?: string;
}
