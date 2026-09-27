import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HospitalUser } from '../../../models/user';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './doctor-dashboard.component.html',
  styleUrl: './doctor-dashboard.component.css'
})
export class DoctorDashboardComponent {

  currentUser: HospitalUser | null = null;

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
  }

}