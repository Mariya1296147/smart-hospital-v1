import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PublicBookingService, PublicDepartmentOption } from '../../../core/services/public-booking.service';

interface DepartmentCard extends PublicDepartmentOption {
  name: string;
  icon: string;
  doctors: number;
}

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.css'
})
export class DepartmentsComponent implements OnInit {
  departments: DepartmentCard[] = [];
  loading = true;
  error = '';

  private readonly icons: Record<string, string> = {
    cardiology: 'bi bi-heart-pulse-fill', neurology: 'bi bi-activity',
    pediatrics: 'bi bi-person-hearts', orthopedics: 'bi bi-bandaid-fill',
    dermatology: 'bi bi-person-fill', gynecology: 'bi bi-gender-female',
    ent: 'bi bi-ear-fill', ophthalmology: 'bi bi-eye-fill',
    pulmonology: 'bi bi-lungs-fill', urology: 'bi bi-person-check-fill',
    'general medicine': 'bi bi-capsule-pill', 'general surgery': 'bi bi-scissors'
  };

  constructor(private readonly booking: PublicBookingService) {}

  ngOnInit(): void {
    forkJoin({ departments: this.booking.getDepartments(), doctors: this.booking.getDoctors() }).subscribe({
      next: ({ departments, doctors }) => {
        this.departments = (departments ?? []).map(department => ({
          ...department,
          name: department.departmentName,
          icon: this.icons[department.departmentName.toLowerCase()] || 'bi bi-hospital-fill',
          doctors: (doctors ?? []).filter(doctor => doctor.departmentId === department.id).length
        }));
        this.loading = false;
      },
      error: error => {
        console.error('Public department list failed to load:', error);
        this.error = 'Department information is temporarily unavailable.';
        this.loading = false;
      }
    });
  }
}
