import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ROLE_LABELS, UserRole } from '../../../models/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email = '';
  password = '';
  message = '';
  selectedRole: UserRole | null = null;

  readonly roles: Array<{ value: UserRole; icon: string }> = [
    { value: 'admin', icon: 'bi-shield-lock' },
    { value: 'doctor', icon: 'bi-person-badge' },
    { value: 'receptionist', icon: 'bi-person-lines-fill' },
    { value: 'nurse', icon: 'bi-heart-pulse' },
    { value: 'laboratory_staff', icon: 'bi-eyedropper' },
    { value: 'pharmacy_staff', icon: 'bi-capsule' },
    { value: 'accounts_staff', icon: 'bi-wallet2' }
  ];

  readonly roleLabels = ROLE_LABELS;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {

    if (!this.selectedRole) {
      this.message = 'Please select your role to continue.';
      return;
    }

    if (!this.email || !this.password) {
      this.message = 'Please enter your email and password.';
      return;
    }

    const result = this.authService.login(
      this.email,
      this.password,
      this.selectedRole
    );

    this.message = result.message;

    if (result.success && result.user) {
      this.router.navigateByUrl(
        this.authService.dashboardRoute(result.user.role)
      );
    }
  }
}