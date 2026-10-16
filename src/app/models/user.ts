// export type UserRole =
//   | 'admin'
//   | 'doctor'
//   | 'receptionist'
//   | 'nurse'
//   | 'laboratory_staff'
//   | 'pharmacy_staff'
//   | 'accounts_staff';
export type UserRole =
  | 'ADMIN'
  | 'DOCTOR'
  | 'RECEPTIONIST'
  | 'NURSE'
  | 'LABORATORY_STAFF'
  | 'PHARMACY_STAFF'
  | 'ACCOUNTS_STAFF';
  
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
  ADMIN: 'Admin',
  DOCTOR: 'Doctor',
  RECEPTIONIST: 'Receptionist',
  NURSE: 'Nurse',
  LABORATORY_STAFF: 'Laboratory Staff',
  PHARMACY_STAFF: 'Pharmacy Staff',
  ACCOUNTS_STAFF: 'Accounts Staff'
};

export const PUBLIC_REGISTRATION_ROLES: UserRole[] = [
  'DOCTOR',
  'RECEPTIONIST',
  'NURSE',
  'LABORATORY_STAFF',
  'PHARMACY_STAFF',
  'ACCOUNTS_STAFF'
];


export interface UserDTO {
  userName: string;
  userFirstName: string;
  userLastName: string;
  email: string;
  enabled: boolean;
  roles: UserRole[];
  dateCreated: string;
  password?: string; // Optional, only used when creating a new user
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JwtResponse {
  token: string;
  user: UserDTO;
}