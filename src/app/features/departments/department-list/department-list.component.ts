import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Department } from '../../../models/department';
import { DepartmentService } from '../../../core/services/department.service';


@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './department-list.component.html',
  styleUrl: './department-list.component.css'
})
export class DepartmentListComponent implements OnInit {
  private departmentService = inject(DepartmentService);

  departments: Department[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;
    this.errorMessage = '';

    this.departmentService.getAll().subscribe({
      next: (data) => {
        this.departments = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Departments not loaded';
        this.loading = false;
      }
    });
  }

  deleteDepartment(id: number): void {
    if (!confirm('Department delete ?')) {
      return;
    }

    this.departmentService.delete(id).subscribe({
      next: () => {
        this.departments = this.departments.filter(
          department => department.id !== id
        );
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Department not deleted';
      }
    });
  }
}