export interface Nurse {
  id: number;
  nurseId: string;
  name: string;
  gender: string;
  phone: string;
  email: string;
  department: string;
  /** Database ID used when assigning a department to this nurse. */
  departmentId?: number | null;
  ward: string;
  shift: string;
  qualification: string;
  joiningDate: string;
  status: string;
}
