export interface Admission {
  id: number;
  admissionId: string;
  patientName: string;
  patientId?: number;
  patientCode?: string;
  patientPhone?: string;
  patientAge?: number;
  patientGender?: string;
  sourcePrescriptionId?: number;
  department: string;
  departmentId?: number;
  doctor: string;
  doctorId?: number;
  admissionDate: string;
  ward: string;
  wardId?: number;
  bed: string;
  bedId?: number;
  bedType?: string;
  assignedNurseId?: number;
  assignedNurseName?: string;
  reason: string;
  status: string;
}
