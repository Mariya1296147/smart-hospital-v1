import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ROLE_LABELS, UserRole } from '../../models/user';

interface StaffNavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-staff-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './staff-layout.component.html',
  styleUrl: './staff-layout.component.css'
})
export class StaffLayoutComponent {
  readonly user = this.authService.getCurrentUser();
  readonly role: UserRole = this.user?.role ?? 'nurse';
  readonly roleLabel = ROLE_LABELS[this.role];
  readonly menuItems: StaffNavItem[] = this.getMenuItems(this.role);
  mobileMenuOpen = false;
  sidebarOpen = false;

  constructor(private authService: AuthService) {}

  toggleMenu(): void {
    this.sidebarOpen = !this.sidebarOpen;
    this.mobileMenuOpen = this.sidebarOpen;
  }

  logout(): void {
    this.authService.logout();
  }

  private getMenuItems(role: UserRole): StaffNavItem[] {
    const menus: Partial<Record<UserRole, StaffNavItem[]>> = {
      admin: [
        { label: 'Admin dashboard', icon: 'bi-grid-1x2', route: '/admin/dashboard' }
      ],
      nurse: [
        { label: 'Dashboard', icon: 'bi-grid-1x2', route: '/nurse/dashboard' },
        { label: 'Patients', icon: 'bi-people', route: '/nurse/patients' },
        { label: 'Nursing care', icon: 'bi-heart-pulse', route: '/nurse/nursing' },
        { label: 'Admissions', icon: 'bi-hospital', route: '/nurse/admissions' },
        { label: 'Consultations', icon: 'bi-clipboard2-pulse', route: '/nurse/consultations' },
        { label: 'Laboratory tests', icon: 'bi-eyedropper', route: '/nurse/laboratory' }
      ],
      laboratory_staff: [
        { label: 'Dashboard', icon: 'bi-grid-1x2', route: '/laboratory/dashboard' },
        { label: 'Test requests', icon: 'bi-eyedropper', route: '/laboratory/tests' },
        { label: 'Patients', icon: 'bi-people', route: '/laboratory/patients' }
      ],
      pharmacy_staff: [
        { label: 'Dashboard', icon: 'bi-grid-1x2', route: '/pharmacy/dashboard' },
        { label: 'Prescriptions & stock', icon: 'bi-capsule', route: '/pharmacy/stock' },
        { label: 'Patients', icon: 'bi-people', route: '/pharmacy/patients' }
      ],
      accounts_staff: [
        { label: 'Dashboard', icon: 'bi-grid-1x2', route: '/accounts/dashboard' },
        { label: 'Billing', icon: 'bi-receipt', route: '/accounts/billing' },
        { label: 'Reports', icon: 'bi-bar-chart', route: '/accounts/reports' }
      ]
    };

    return menus[role] ?? [];
  }
}
