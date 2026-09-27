import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ROLE_LABELS, UserRole } from '../../../models/user';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() isOpen: boolean = false;

  @Output() toggle = new EventEmitter<void>();

  constructor(
    private authService: AuthService
  ) { }

  toggleSidebar(): void {
    this.toggle.emit();
  }

  logout(): void {
    this.authService.logout();
  }

  get userName(): string { return this.authService.getCurrentUser()?.name ?? 'User'; }
  get role(): UserRole | undefined { return this.authService.getCurrentUser()?.role; }
  get roleLabel(): string { return this.role ? ROLE_LABELS[this.role] : ''; }
  get dashboardLink(): string { return this.authService.dashboardRoute(); }
  canSee(...roles: UserRole[]): boolean { return this.authService.hasAnyRole(roles); }

}
