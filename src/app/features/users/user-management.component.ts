
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  AdminRegisterRequest,
  RegisterRequest,
  ROLE_LABELS,
  UserDTO,
  UserRole,
  UserStatus
} from '../../models/user';

import { AuthService } from '../../core/services/auth.service';

type UserForm = UserDTO & {
  password: string;
};

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html'
})
export class UserManagementComponent implements OnInit {

  readonly roles = Object.keys(ROLE_LABELS) as UserRole[];
  readonly labels = ROLE_LABELS;
  selectedRole: UserRole | '' = '';

  users: UserDTO[] = [];

showAddForm = false;
isLoading = false;
isSaving = false;

errorMessage = '';
successMessage = '';

  

  newUser: UserForm = this.createEmptyUser();

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.refresh();
  }

  private createEmptyUser(): UserForm {
    return {
      userName: '',
      email: '',
      userFirstName: '',
      userLastName: '',
      password: '',
      enabled: false,
      roles: [],
      dateCreated: ''
    };
  }

  // LOAD USERS
  refresh(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error.status === 403
            ? 'You do not have permission to view users.'
            : 'Failed to load users. Please try again.';
        console.error('Load users failed:', error);
      }
    });
  }

  // OPEN ADD FORM
  openAddForm(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.selectedRole = '';

    this.newUser = this.createEmptyUser();
    this.showAddForm = true;
  }

  // CLOSE ADD FORM
  closeAddForm(): void {
    this.showAddForm = false;
    this.selectedRole = '';

    this.newUser = this.createEmptyUser();
  }

  // CREATE USER
  // createUser(): void {
  //   if (this.isSaving) return;

  //   const request: RegisterRequest = {
  //     username: this.newUser.userName.trim(),
  //     email: this.newUser.email.trim(),
  //     firstName: this.newUser.userFirstName.trim(),
  //     lastName: this.newUser.userLastName.trim(),
  //     password: this.newUser.password
  //   };

  //   if (
  //     !request.username ||
  //     !request.email ||
  //     !request.firstName ||
  //     !request.lastName ||
  //     !request.password
  //   ) {
  //     this.errorMessage = 'Please fill in all required fields.';
  //     return;
  //   }

  //   if (request.password.length < 8) {
  //     this.errorMessage = 'Password must be at least 8 characters.';
  //     return;
  //   }

  //   this.isSaving = true;
  //   this.errorMessage = '';
  //   this.successMessage = '';

  //   this.authService.register(request).subscribe({
  //     next: (message) => {
  //       this.isSaving = false;
  //       this.successMessage =
  //         message || 'User registered successfully.';

  //       this.closeAddForm();
  //       this.refresh();
  //     },
  //     error: (error) => {
  //       this.isSaving = false;
  //       this.errorMessage =
  //         error.error?.message ||
  //         (typeof error.error === 'string'
  //           ? error.error
  //           : 'Failed to register user. Please try again.');

  //       console.error('Register user failed:', error);
  //     }
  //   });
  // }

  createUser(): void {

    console.log("------------------------------");
    
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedRole) {
      this.errorMessage = 'Please select a role.';
      return;
    }

    if (!this.newUser.password ||
      this.newUser.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters.';
      return;
    }

    const request: AdminRegisterRequest = {
      username: this.newUser.userName.trim(),
      firstName: this.newUser.userFirstName.trim(),
      lastName: this.newUser.userLastName.trim(),
      email: this.newUser.email.trim(),
      password: this.newUser.password,
      roles: [this.selectedRole]
    };

    this.isSaving = true;

    this.authService.registerByAdmin(request).subscribe({
      next: (message) => {
        this.successMessage = message || 'User created successfully.';
        this.isSaving = false;
        this.showAddForm = false;
        this.selectedRole = '';
        this.newUser = this.createEmptyUser();
        this.refresh();
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage =
          error?.error?.message ||
          (typeof error?.error === 'string'
            ? error.error
            : 'Unable to create user. Please try again.');
      }
    });
  }
  // UPDATE USER
  update(
    username: string,
    changes: Partial<UserDTO>
  ): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.updateUser(username, changes).subscribe({
      next: (updatedUser) => {
        this.users = this.users.map(user =>
          user.userName === username ? updatedUser : user
        );

        this.successMessage = 'User updated successfully.';
      },
      error: (error) => {
        this.errorMessage =
          error.status === 403
            ? 'You do not have permission to update this user.'
            : 'Failed to update user.';

        console.error('Update user failed:', error);
      }
    });
  }

  // DELETE USER
  deleteUser(username: string): void {
    if (!confirm(`Are you sure you want to delete ${username}?`)) {
      return;
    }

    this.errorMessage = '';

    this.authService.deleteUser(username).subscribe({
      next: () => {
        this.users = this.users.filter(
          user => user.userName !== username
        );

        this.successMessage = 'User deleted successfully.';
      },
      error: (error) => {
        this.errorMessage =
          error.status === 403
            ? 'Only an administrator can delete users.'
            : 'Failed to delete user.';

        console.error('Delete user failed:', error);
      }
    });
  }

  // ENABLE / DISABLE USER
  toggleUserStatus(user: UserDTO): void {
    const enabled = !user.enabled;

    this.authService.updateUserStatus(
      user.userName,
      enabled
    ).subscribe({
      next: (updatedUser) => {
        this.users = this.users.map(item =>
          item.userName === updatedUser.userName
            ? updatedUser
            : item
        );

        this.successMessage = enabled
          ? 'User enabled successfully.'
          : 'User disabled successfully.';
      },
      error: (error) => {
        this.errorMessage =
          error.status === 403
            ? 'Only an administrator can change user status.'
            : 'Failed to change user status.';

        console.error('Update status failed:', error);
      }
    });
  }

  // RESET FORM
  resetForm(): void {
    this.newUser = this.createEmptyUser();
    this.errorMessage = '';
  }

  // STATUS BADGE
  statusClass(status: UserStatus | string | null | undefined): string {
    switch ((status ?? '').toUpperCase()) {
      case 'ACTIVE':
      case 'APPROVED':
        return 'bg-success';

      case 'PENDING':
        return 'bg-warning text-dark';

      case 'INACTIVE':
      case 'REJECTED':
        return 'bg-secondary';

      default:
        return 'bg-secondary';
    }
  }
}
