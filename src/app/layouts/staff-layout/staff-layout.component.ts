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
  readonly role: UserRole = this.user?.roles[0] ?? 'NURSE';
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
      ADMIN: [
        { label: 'Admin dashboard', icon: 'bi-grid-1x2', route: '/admin/dashboard' }
      ],
      NURSE: [
        { label: 'Dashboard', icon: 'bi-grid-1x2', route: '/nurse/dashboard' },
        { label: 'My Patients', icon: 'bi-people', route: '/nurse/patients' },
        { label: 'Admitted Patients', icon: 'bi-person-vcard', route: '/nurse/admitted-patients' },
        { label: 'Vital Signs', icon: 'bi-heart-pulse', route: '/nurse/vital-signs' },
        { label: 'Medicine', icon: 'bi-capsule', route: '/nurse/medicine' },
        { label: 'Admission', icon: 'bi-hospital', route: '/nurse/admissions' },
        { label: 'New Admission', icon: 'bi-person-plus', route: '/nurse/admissions/new' },
        { label: 'Nursing Notes', icon: 'bi-journal-medical', route: '/nurse/nursing-notes' },
        { label: 'Lab Test Requests', icon: 'bi-eyedropper', route: '/nurse/laboratory' },
        { label: 'My Profile', icon: 'bi-person-circle', route: '/nurse/profile' }
      ],
      LABORATORY_STAFF: [
        { label: 'Dashboard', icon: 'bi-grid-1x2', route: '/laboratory/dashboard' },
        { label: 'Pending Tests', icon: 'bi-clipboard2-pulse', route: '/laboratory/pending' },
        { label: 'In Progress', icon: 'bi-hourglass-split', route: '/laboratory/in-progress' },
        { label: 'Sample Collection', icon: 'bi-droplet', route: '/laboratory/sample-collection' },
        { label: 'Test Processing', icon: 'bi-gear', route: '/laboratory/processing' },
        { label: 'Result Entry', icon: 'bi-pencil-square', route: '/laboratory/result-entry' },
        { label: 'Completed Reports', icon: 'bi-file-earmark-medical', route: '/laboratory/reports' }
      ],
      PHARMACY_STAFF: [
        { label: 'Dashboard', icon: 'bi-grid-1x2', route: '/pharmacy/dashboard' },
        { label: 'Medicine Stock', icon: 'bi-capsule', route: '/pharmacy/stock' },
        { label: 'Purchases', icon: 'bi-box-arrow-in-down', route: '/pharmacy/purchases' },
        { label: 'Sales', icon: 'bi-cart-check', route: '/pharmacy/sales' }
      ],
      ACCOUNTS_STAFF: [
        { label: 'Dashboard', icon: 'bi-grid-1x2', route: '/accounts/dashboard' },
        { label: 'Admission Management', icon: 'bi-hospital', route: '/accounts/admissions' },
        { label: 'Billing', icon: 'bi-receipt', route: '/accounts/billing' },
        { label: 'Reports', icon: 'bi-bar-chart', route: '/accounts/reports' }
      ]
    };

    return menus[role] ?? [];
  }
}
