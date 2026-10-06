import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HospitalUser, UserRole } from '../../models/user';

export interface RegistrationInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  department: string;
  education: string;
  experience: string;
  nid: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: HospitalUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly usersKey = 'smart-hospital-users';
  private readonly sessionKey = 'smart-hospital-current-user';

  constructor(private router: Router) {
    this.seedAdmin();
  }

  // =====================================================
  // LOGIN
  // =====================================================

  login(email: string, password: string, expectedRole?: UserRole): AuthResult {

    const user = this.getUsers().find(
      item =>
        item.email.toLowerCase() === email.trim().toLowerCase() &&
        item.password === password
    );

    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password.'
      };
    }

    if (expectedRole && user.role !== expectedRole) {
      return {
        success: false,
        message: 'Invalid email, password, or selected role.'
      };
    }

    if (user.status === 'pending') {
      return {
        success: false,
        message: 'Your account is waiting for Admin approval.'
      };
    }

    if (user.status === 'inactive') {
      return {
        success: false,
        message: 'This account is inactive. Please contact the Admin.'
      };
    }

    localStorage.setItem(
      this.sessionKey,
      JSON.stringify(user)
    );

    return {
      success: true,
      message: 'Login successful.',
      user
    };
  }


  // =====================================================
  // REGISTER
  // =====================================================

  register(input: RegistrationInput): AuthResult {

    const email = input.email.trim().toLowerCase();

    if (
      this.getUsers().some(
        user => user.email.toLowerCase() === email
      )
    ) {
      return {
        success: false,
        message: 'An account already exists with this email address.'
      };
    }

    const user: HospitalUser = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      email,
      phone: input.phone.trim(),
      password: input.password,
      role: input.role,

      department: input.department.trim(),
      education: input.education.trim(),
      experience: input.experience.trim(),
      nid: input.nid.trim(),

      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.saveUsers([
      ...this.getUsers(),
      user
    ]);

    return {
      success: true,
      message: 'Registration submitted. Please wait for Admin approval.'
    };
  }


  // =====================================================
  // LOGOUT
  // =====================================================

  logout(): void {
    localStorage.removeItem(this.sessionKey);
    this.router.navigate(['/login']);
  }


  // =====================================================
  // AUTH STATUS
  // =====================================================

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }


  // =====================================================
  // CURRENT USER
  // =====================================================

  getCurrentUser(): HospitalUser | null {

    const savedUser = localStorage.getItem(this.sessionKey);

    return savedUser
      ? JSON.parse(savedUser) as HospitalUser
      : null;
  }


  // =====================================================
  // GET ALL USERS
  // =====================================================

  getUsers(): HospitalUser[] {

    const savedUsers = localStorage.getItem(this.usersKey);

    return savedUsers
      ? JSON.parse(savedUsers) as HospitalUser[]
      : [];
  }


  // =====================================================
  // UPDATE USER
  // =====================================================

  updateUser(
    id: string,
    changes: Partial<Pick<HospitalUser, 'role' | 'status'>>
  ): void {

    const users = this.getUsers().map(user =>
      user.id === id
        ? { ...user, ...changes }
        : user
    );

    this.saveUsers(users);

    const currentUser = this.getCurrentUser();

    if (currentUser?.id === id) {

      const updatedUser = users.find(
        user => user.id === id
      );

      if (updatedUser) {
        localStorage.setItem(
          this.sessionKey,
          JSON.stringify(updatedUser)
        );
      }
    }
  }


  // =====================================================
  // ROLE CHECK
  // =====================================================

  hasAnyRole(roles: UserRole[]): boolean {

    const user = this.getCurrentUser();

    return !!user &&
      (user.role === 'admin' || roles.includes(user.role));
  }


  // =====================================================
  // URL ACCESS CONTROL
  // =====================================================

  canAccessUrl(url: string): boolean {

    const user = this.getCurrentUser();

    if (!user) {
      return false;
    }

    // Admin can access admin area
    if (user.role === 'admin') {
      return true;
    }

    const path = url.split('?')[0];

    const permissions: Array<{
      prefix: string;
      roles: UserRole[];
    }> = [

      // =================================================
      // DOCTOR
      // =================================================

      {
        prefix: '/doctor',
        roles: ['doctor']
      },

      // =================================================
      // RECEPTIONIST
      // =================================================

      {
        prefix: '/reception',
        roles: ['receptionist']
      },

      // =================================================
      // NURSE
      // =================================================

      {
        prefix: '/nurse',
        roles: ['nurse']
      },

      // =================================================
      // LABORATORY
      // =================================================

      {
        prefix: '/laboratory',
        roles: ['laboratory_staff']
      },

      // =================================================
      // PHARMACY
      // =================================================

      {
        prefix: '/pharmacy',
        roles: ['pharmacy_staff']
      },

      // =================================================
      // ACCOUNTS
      // =================================================

      {
        prefix: '/accounts',
        roles: ['accounts_staff']
      },

      // =================================================
      // PATIENT
      // =================================================

      // {
      //   prefix: '/patient',
      //   roles: ['patient']
      // },

    ];

    const permission = permissions.find(
      item => path.startsWith(item.prefix)
    );

    return !!permission &&
      permission.roles.includes(user.role);
  }


  // =====================================================
  // DASHBOARD ROUTE
  // =====================================================

  dashboardRoute(
    role = this.getCurrentUser()?.role
  ): string {

    const routes: Record<UserRole, string> = {

      admin: '/admin/dashboard',

      doctor: '/doctor/dashboard',

      receptionist: '/reception/dashboard',

      nurse: '/nurse/dashboard',

      laboratory_staff: '/laboratory/dashboard',

      pharmacy_staff: '/pharmacy/dashboard',

      accounts_staff: '/accounts/dashboard',

      // patient: '/patient/dashboard'

    };

    return role
      ? routes[role]
      : '/login';
  }


  // =====================================================
  // DEFAULT USERS
  // =====================================================

  private seedAdmin(): void {

    const defaults: HospitalUser[] = [

      {
        id: 'admin-001',
        name: 'System Administrator',
        email: 'admin@gmail.com',
        phone: '',
        password: '123456',
        role: 'admin',
        department: 'Administration',
        education: 'Hospital Administration',
        experience: '10 Years',
        nid: '',
        status: 'approved',
        createdAt: new Date().toISOString()
      },

      {
        id: 'doctor-001',
        name: 'Dr. Amina Rahman',
        email: 'doctor@smarthospital.com',
        phone: '01700000001',
        password: '123456',
        role: 'doctor',
        department: 'Cardiology',
        education: 'MBBS, FCPS',
        experience: '8 Years',
        nid: '',
        status: 'approved',
        createdAt: new Date().toISOString()
      },

      {
        id: 'reception-001',
        name: 'Nusrat Akter',
        email: 'reception@smarthospital.com',
        phone: '01700000002',
        password: '123456',
        role: 'receptionist',
        department: 'Reception',
        education: 'Bachelor Degree',
        experience: '4 Years',
        nid: '',
        status: 'approved',
        createdAt: new Date().toISOString()
      },

      {
        id: 'nurse-001',
        name: 'Sadia Islam',
        email: 'nurse@smarthospital.com',
        phone: '01700000003',
        password: '123456',
        role: 'nurse',
        department: 'Nursing',
        education: 'BSc in Nursing',
        experience: '5 Years',
        nid: '',
        status: 'approved',
        createdAt: new Date().toISOString()
      },

      {
        id: 'laboratory-001',
        name: 'Rafiq Hasan',
        email: 'laboratory@smarthospital.com',
        phone: '01700000004',
        password: '123456',
        role: 'laboratory_staff',
        department: 'Laboratory',
        education: 'BSc in Medical Laboratory',
        experience: '5 Years',
        nid: '',
        status: 'approved',
        createdAt: new Date().toISOString()
      },

      {
        id: 'pharmacy-001',
        name: 'Mim Sultana',
        email: 'pharmacy@smarthospital.com',
        phone: '01700000005',
        password: '123456',
        role: 'pharmacy_staff',
        department: 'Pharmacy',
        education: 'B.Pharm',
        experience: '4 Years',
        nid: '',
        status: 'approved',
        createdAt: new Date().toISOString()
      },

      {
        id: 'accounts-001',
        name: 'Karim Hossain',
        email: 'accounts@smarthospital.com',
        phone: '01700000006',
        password: '123456',
        role: 'accounts_staff',
        department: 'Accounts',
        education: 'BBA in Accounting',
        experience: '6 Years',
        nid: '',
        status: 'approved',
        createdAt: new Date().toISOString()
      }

    ];

    const users = this.getUsers();

    this.saveUsers([
      ...users,
      ...defaults.filter(
        item =>
          !users.some(
            user => user.email === item.email
          )
      )
    ]);
  }


  // =====================================================
  // SAVE USERS
  // =====================================================

  private saveUsers(users: HospitalUser[]): void {

    localStorage.setItem(
      this.usersKey,
      JSON.stringify(users)
    );
  }

}