export type UserRole =
  | 'admin'
  | 'doctor'
  | 'receptionist'
  | 'nurse'
  | 'laboratory_staff'
  | 'pharmacy_staff'
  | 'accounts_staff';

export type UserStatus = 'approved' | 'pending' | 'inactive';

export interface HospitalUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;

  role: UserRole;

  // Staff Information
  department: string;
  education: string;
  experience: string;
  nid: string;

  status: UserStatus;
  createdAt: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  doctor: 'Doctor',
  receptionist: 'Receptionist',
  nurse: 'Nurse',
  laboratory_staff: 'Laboratory Staff',
  pharmacy_staff: 'Pharmacy Staff',
  accounts_staff: 'Accounts Staff'
};

export const PUBLIC_REGISTRATION_ROLES: UserRole[] = [
  'doctor',
  'receptionist',
  'nurse',
  'laboratory_staff',
  'pharmacy_staff',
  'accounts_staff'
];