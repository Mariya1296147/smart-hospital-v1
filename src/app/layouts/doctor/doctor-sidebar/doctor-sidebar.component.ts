import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-doctor-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './doctor-sidebar.component.html',
  styleUrl: './doctor-sidebar.component.css'
})
export class DoctorSidebarComponent {

  @Input() isOpen = false;

  @Output() toggle = new EventEmitter<void>();

  userName = 'Dr. Amina Rahman';
  roleLabel = 'Doctor';

  constructor(
    private authService: AuthService
  ) {
    const user = this.authService.getCurrentUser();

    if (user) {
      this.userName = user.name;
      this.roleLabel = 'Doctor';
    }
  }

  toggleSidebar(): void {
    this.toggle.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}