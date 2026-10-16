import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  HospitalUser,
  RegisterRequest,
  ROLE_LABELS,
  UserDTO,
  UserRole,
  UserStatus
} from '../../models/user';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html'
})
export class UserManagementComponent {

  readonly roles = Object.keys(ROLE_LABELS) as UserRole[];
  readonly labels = ROLE_LABELS;

  users: UserDTO[] = [];

  showAddForm = false;

  newUser: UserDTO = {
    userName: '',
    email: '',
    userFirstName: '',
    userLastName: '',
    enabled: false,
    roles: [],
    dateCreated: ''
  };

  constructor(private authService: AuthService) {
    this.refresh();
  }

  refresh(): void {
    this.authService.getAllUsers().subscribe((users) => {
      this.users = users;
    });
  }

  openAddForm(): void {
    this.showAddForm = true;
  }

  closeAddForm(): void {
    this.showAddForm = false;
    this.resetForm();
  }

  createUser(): void {
    const regesterUser: RegisterRequest = {
      username: this.newUser.userName,
      email: this.newUser.email,
      firstName: this.newUser.userFirstName,
      lastName: this.newUser.userLastName,
      password: this.newUser.password || 'defaultPassword123' // You might want to generate a random password or have a better default
    };
    this.authService.register(regesterUser);
 

    alert('New user added successfully. The account is waiting for Admin approval.');

    this.refresh();
    this.closeAddForm();
  }

  resetForm(): void {
    this.newUser = {
      userName: '',
      email: '',
      userFirstName: '',
      userLastName: '',
      enabled: false,
      roles: [],
      dateCreated: ''
    };
  }

  update(
    id: string,
    changes: Partial<UserDTO>
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