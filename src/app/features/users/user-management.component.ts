import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, RegistrationInput } from '../../core/services/auth.service';
import {
  HospitalUser,
  ROLE_LABELS,
  UserRole,
  UserStatus
} from '../../models/user';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html'
})
export class UserManagementComponent {

  readonly roles = Object.keys(ROLE_LABELS) as UserRole[];
  readonly labels = ROLE_LABELS;

  users: HospitalUser[] = [];

  showAddForm = false;

  newUser: RegistrationInput = {
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'doctor',
    department: '',
    education: '',
    experience: '',
    nid: ''
  };

  constructor(private authService: AuthService) {
    this.refresh();
  }

  refresh(): void {
    this.users = this.authService.getUsers();
  }

  openAddForm(): void {
    this.showAddForm = true;
  }

  closeAddForm(): void {
    this.showAddForm = false;
    this.resetForm();
  }

  createUser(): void {
    const result = this.authService.register(this.newUser);

    if (!result.success) {
      alert(result.message);
      return;
    }

    alert('New user added successfully. The account is waiting for Admin approval.');

    this.refresh();
    this.closeAddForm();
  }

  resetForm(): void {
    this.newUser = {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'doctor',
      department: '',
      education: '',
      experience: '',
      nid: ''
    };
  }

  update(
    id: string,
    changes: Partial<Pick<HospitalUser, 'role' | 'status'>>
  ): void {
    this.authService.updateUser(id, changes);
    this.refresh();
  }

  statusClass(status: UserStatus): string {
    return status === 'approved'
      ? 'bg-success'
      : status === 'pending'
        ? 'bg-warning text-dark'
        : 'bg-secondary';
  }
}