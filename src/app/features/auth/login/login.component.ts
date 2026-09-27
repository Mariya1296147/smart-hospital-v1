import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {

    if (!this.email || !this.password) {
      this.message = 'Please enter your email and password.';
      return;
    }

    const result = this.authService.login(
      this.email,
      this.password
    );

    this.message = result.message;

    if (result.success && result.user) {
      this.router.navigateByUrl(
        this.authService.dashboardRoute(result.user.role)
      );
    }
  }
}