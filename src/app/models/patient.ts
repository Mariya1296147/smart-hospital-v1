export interface Patient {
  id?: number;
  patientId: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}