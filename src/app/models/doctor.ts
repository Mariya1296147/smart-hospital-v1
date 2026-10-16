export interface Doctor {
  id?: number;
  doctorId: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  specialization?: string;
  qualification?: string;
  experience?: string;
  department?: string;
  availableTime?: string;
  joiningDate?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}