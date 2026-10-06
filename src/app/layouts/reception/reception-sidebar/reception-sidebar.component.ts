
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reception-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './reception-sidebar.component.html',
  styleUrl: './reception-sidebar.component.css'
})
export class ReceptionSidebarComponent {

  @Input() isOpen = false;
  @Output() toggle = new EventEmitter<void>();

  userName = 'Nusrat Akter';
  roleLabel = 'Receptionist';

  constructor(private authService: AuthService) {
    const user = this.authService.getCurrentUser();

    if (user) {
      this.userName = user.name;
      this.roleLabel = 'Receptionist';
    }
  }

  toggleSidebar(): void {
    this.toggle.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}
