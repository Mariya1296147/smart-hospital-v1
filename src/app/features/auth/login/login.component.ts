
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../models/user';

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
  loading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {
    this.message = '';

    if (!this.email.trim() || !this.password) {
      this.message = 'Please enter your email and password.';
      return;
    }

    this.loading = true;

    const request: LoginRequest = {
      email: this.email.trim(),
      password: this.password
    };

    this.authService.login(request).subscribe({
      next: (response) => {
        this.loading = false;

        // The user's role comes from the backend response.
        this.authService.redirectToDashboard();
      },
      error: (error) => {
        this.loading = false;

        if (error.status === 401 || error.status === 403) {
          this.message = 'Invalid email or password.';
        } else if (error.status === 0) {
          this.message = 'Unable to connect to the server.';
        } else {
          this.message =
            error.error?.message || 'Login failed. Please try again.';
        }
      }
    });
  }
}
