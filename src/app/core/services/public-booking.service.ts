import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface PublicDepartmentOption {
  id: number;
  departmentName: string;
  description?: string;
}

export interface PublicDoctorOption {
  id: number;
  name: string;
  specialization?: string;
  qualification?: string;
  experience?: string;
  imageUrl?: string;
  departmentId: number | null;
  departmentName: string | null;
}

@Injectable({ providedIn: 'root' })
export class PublicBookingService {
  constructor(private readonly api: ApiService) {}

  getDepartments(): Observable<PublicDepartmentOption[]> {
    return this.api.getResource<PublicDepartmentOption[]>('public/departments');
  }

  getDoctors(): Observable<PublicDoctorOption[]> {
    return this.api.getResource<PublicDoctorOption[]>('public/doctors');
  }
}
