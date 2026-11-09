
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Department } from '../../../models/department';
import { DepartmentService } from '../../../core/services/department.service';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './department-form.component.html',
  styleUrl: './department-form.component.css'
})
export class DepartmentFormComponent implements OnInit {
  private departmentService = inject(DepartmentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  department: Partial<Department> = {
    departmentName: '',
    departmentCode: '',
    description: ''
  };


  departmentStatus: 'ACTIVE' | 'INACTIVE' = 'ACTIVE';

  departmentId: number | null = null;
  isEditMode = false;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.departmentId = Number(id);
      this.isEditMode = true;
      this.loadDepartment(this.departmentId);
    }
  }

  loadDepartment(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.departmentService.getById(id).subscribe({
      next: (data) => {
        this.department = { ...data };

      
        const existingStatus = (data as any).status;

        if (existingStatus === 'INACTIVE' || existingStatus === 'Inactive') {
          this.departmentStatus = 'INACTIVE';
        } else {
          this.departmentStatus = 'ACTIVE';
        }

        this.loading = false;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Department load ';
        this.loading = false;
      }
    });
  }

  saveDepartment(): void {
    const name = this.department.departmentName?.trim();

    if (!name) {
      this.errorMessage = 'Department Name ';
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      departmentName: name,
      departmentCode: this.department.departmentCode?.trim() || '',
      description: this.department.description?.trim() || ''
    };

    const request =
      this.isEditMode && this.departmentId !== null
        ? this.departmentService.update(this.departmentId, payload)
        : this.departmentService.create(payload);

    request.subscribe({
      next: () => {
        this.router.navigate(['/admin/departments']);
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Department save';
        this.loading = false;
      }
    });
  }
}
