
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Doctor, DoctorService } from '../../../core/services/doctor.service';
import { DepartmentService } from '../../../core/services/department.service';
import { Department } from '../../../models/department';
import { ImageService } from '../../../core/services/image.service';

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './doctor-form.component.html',
  styleUrl: './doctor-form.component.css'
})
export class DoctorFormComponent implements OnInit, OnDestroy {

  isEditMode = false;
  doctorId: number | null = null;
  isSaving = false;
  accountPassword = '';
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  doctor: Doctor = {
    name: '',
    specialization: '',
    department: '',
    email: '',
    phone: '',
    qualification: '',
    experience: '',
    address: '',
    status: 'Active'
  };

  departments: Department[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private doctorService: DoctorService,
    private departmentService: DepartmentService,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.departmentService.getAll().subscribe({
      next: departments => {
        this.departments = departments ?? [];
        this.syncDepartmentSelection();
      },
      error: error => console.error('Failed to load departments:', error)
    });
    const id = this.route.snapshot.paramMap.get('id');

    if (id !== null) {
      this.isEditMode = true;
      this.doctorId = Number(id);

      if (!Number.isFinite(this.doctorId) || this.doctorId <= 0) {
        alert('Invalid doctor ID.');
        this.router.navigate(['/admin/doctors']);
        return;
      }

      this.doctorService.getDoctorById(this.doctorId).subscribe({
        next: (existingDoctor) => {
          this.doctor = {
            ...existingDoctor,
            name: existingDoctor.name ?? '',
            specialization: existingDoctor.specialization ?? '',
            department: existingDoctor.department ?? '',
            email: existingDoctor.email ?? '',
            phone: existingDoctor.phone ?? '',
            qualification: existingDoctor.qualification ?? '',
            experience: existingDoctor.experience ?? '',
            address: existingDoctor.address ?? '',
            imageUrl: existingDoctor.imageUrl ?? '',
            status: existingDoctor.status === 'Inactive'
              ? 'Inactive'
              : 'Active'
          };
          this.syncDepartmentSelection();
        },
        error: (error) => {
          console.error('Failed to load doctor:', error);
          alert('Unable to load doctor details.');
          this.router.navigate(['/admin/doctors']);
        }
      });
    }
  }

  saveDoctor(): void {
    if (
      !this.doctor.name.trim() ||
      !this.doctor.specialization ||
      !this.doctor.departmentId ||
      !this.doctor.email.trim() ||
      !(this.doctor.phone ?? '').trim()
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    if (!this.isEditMode && this.accountPassword.length < 8) {
      alert('Set an initial login password with at least 8 characters.');
      return;
    }

    if (this.isSaving) {
      return;
    }

    this.isSaving = true;

    if (this.selectedImage) {
      this.imageService.upload(this.selectedImage).subscribe({
        next: uploaded => {
          this.doctor.imageUrl = uploaded.imageUrl;
          this.saveDoctorRecord();
        },
        error: error => {
          console.error('Doctor photo upload failed:', error);
          alert(error.error?.message || 'Doctor photo could not be uploaded.');
          this.isSaving = false;
        }
      });
      return;
    }

    this.saveDoctorRecord();
  }

  private saveDoctorRecord(): void {

    if (this.isEditMode && this.doctorId !== null) {
      this.doctorService.updateDoctor(
        this.doctorId,
        this.doctor
      ).subscribe({
        next: () => {
          alert('Doctor updated successfully!');
          this.router.navigate(['/admin/doctors']);
        },
        error: (error) => {
          console.error('Failed to update doctor:', error);
          alert(this.getApiErrorMessage(error, 'Failed to update doctor. Please try again.'));
          this.isSaving = false;
        }
      });
    } else {
      this.doctorService.addDoctor(this.doctor, this.accountPassword).subscribe({
        next: () => {
          alert(`Doctor and DOCTOR login account created. Login email: ${this.doctor.email}`);
          this.router.navigate(['/admin/doctors']);
        },
        error: (error) => {
          console.error('Failed to add doctor:', error);
          alert(this.getApiErrorMessage(error, 'Failed to add doctor. Please try again.'));
          this.isSaving = false;
        }
      });
    }
  }

  private syncDepartmentSelection(): void {
    if (this.doctor.departmentId != null
        && this.departments.some(department => department.id === this.doctor.departmentId)) {
      return;
    }
    const departmentName = this.doctor.department?.trim().toLocaleLowerCase();
    if (!departmentName) return;
    const matchingDepartment = this.departments.find(department =>
      department.departmentName.trim().toLocaleLowerCase() === departmentName);
    if (matchingDepartment) this.doctor.departmentId = matchingDepartment.id;
  }

  private getApiErrorMessage(error: any, fallback: string): string {
    const response = error?.error;
    if (typeof response === 'string' && response.trim()) return response;
    if (typeof response?.message === 'string' && response.message.trim()) return response.message;
    if (typeof response?.error === 'string' && response.error.trim()) return response.error;
    return fallback;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
      alert('Choose a JPEG, PNG, or WEBP image up to 5 MB.');
      input.value = '';
      return;
    }

    if (this.imagePreview) URL.revokeObjectURL(this.imagePreview);
    this.selectedImage = file;
    this.imagePreview = URL.createObjectURL(file);
  }

  clearImage(): void {
    if (this.imagePreview) URL.revokeObjectURL(this.imagePreview);
    this.imagePreview = null;
    this.selectedImage = null;
    this.doctor.imageUrl = '';
  }

  imageSource(path?: string): string {
    return this.imagePreview || this.imageService.imageSource(path);
  }

  ngOnDestroy(): void {
    if (this.imagePreview) URL.revokeObjectURL(this.imagePreview);
  }

  cancel(): void {
    this.router.navigate(['/admin/doctors']);
  }
}
