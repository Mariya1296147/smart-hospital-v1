import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Router,
  ActivatedRoute,
  RouterLink
} from '@angular/router';
import { Nurse } from '../../../models/nursing';
import { NurseService } from '../../../core/services/nursing.service';
import { DepartmentService } from '../../../core/services/department.service';
import { FacilityService, WardOption } from '../../../core/services/facility.service';
import { Department } from '../../../models/department';



@Component({
  selector: 'app-nurse-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './nurse-form.component.html',
  styleUrl: './nurse-form.component.css'
})
export class NurseFormComponent implements OnInit {

  isEdit = false;
  nurseId = 0;
  accountPassword = '';

  nurse: Nurse = {
    id: 0,
    nurseId: '',
    name: '',
    gender: '',
    phone: '',
    email: '',
    department: '',
    departmentId: null,
    ward: '',
    shift: '',
    qualification: '',
    joiningDate: '',
    status: 'Active'
  };
  departments: Department[] = [];
  wards: WardOption[] = [];

  constructor(
    private nurseService: NurseService,
    private departmentService: DepartmentService,
    private facilityService: FacilityService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.departmentService.getAll().subscribe({
      next: items => this.departments = items ?? [],
      error: error => console.error('Departments failed to load', error)
    });
    this.facilityService.getWards().subscribe({
      next: items => this.wards = items ?? [],
      error: error => console.error('Wards failed to load', error)
    });

    const id =
      this.route.snapshot.paramMap.get('id');

    if (id) {

      this.isEdit = true;

      this.nurseId = Number(id);

      this.nurseService.getNurseById(this.nurseId).subscribe({
        next: existing => {
          // Admin's by-id endpoint returns the JPA Department object, while
          // /me and list DTOs expose the department name and ID separately.
          const response = existing as Nurse & { department?: unknown; departmentId?: number | null };
          const department = response.department;
          const departmentId = response.departmentId
            ?? (department && typeof department === 'object'
              ? Number((department as { id?: number }).id) || null
              : null);
          this.nurse = {
            ...existing,
            department: typeof department === 'string'
              ? department
              : (department as { departmentName?: string } | null)?.departmentName ?? '',
            departmentId
          };
        },
        error: error => console.error('নার্সের তথ্য লোড করা যায়নি', error)
      });
    }
  }

  saveNurse(): void {

    if (!this.nurse.name.trim() || !this.nurse.email?.trim()) {
      alert('Nurse name and email are required.');
      return;
    }

    if (this.isEdit) {

      this.nurseService.updateNurse(this.nurseId, this.nurse).subscribe({
        next: () => { alert('নার্সের তথ্য হালনাগাদ হয়েছে।'); this.router.navigate(['/admin/nursing']); },
        error: error => console.error('নার্সের তথ্য হালনাগাদ ব্যর্থ', error)
      });

    } else {

      if (this.accountPassword.length < 8) {
        alert('Set an initial login password with at least 8 characters.');
        return;
      }

      this.nurseService.addNurse(this.nurse, this.accountPassword).subscribe({
        next: () => { alert(`Nurse and NURSE login account created. Login email: ${this.nurse.email}`); this.router.navigate(['/admin/nursing']); },
        error: error => alert(error.error?.message || 'Nurse and login account could not be created.')
      });
    }

  }
}
