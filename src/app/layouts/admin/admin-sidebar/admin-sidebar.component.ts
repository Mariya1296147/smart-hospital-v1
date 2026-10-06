import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css'
})
export class AdminSidebarComponent {

  @Input() isOpen = false;

  @Output() toggle = new EventEmitter<void>();

  userName = 'Administrator';
  roleLabel = 'Admin';

  constructor(
    private authService: AuthService
  ) {
    const user = this.authService.getCurrentUser();

    if (user) {
      this.userName = user.name;
      this.roleLabel = 'Admin';
    }
  }

  toggleSidebar(): void {
    this.toggle.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}