
export interface Patient {
  id?: number;
  patientId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  maritalStatus?: string;
  department?: string;
  doctor?: string;
  allergies?: string;
  medicalHistory?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}
