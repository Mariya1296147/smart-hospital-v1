
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Doctor } from '../../models/doctor';
import { ApiService } from './api.service';

type DoctorRequestProfile = Omit<Doctor, 'department' | 'departmentId'> & {
  department: { id: number } | null;
};

// পুরোনো component import-গুলো কাজ করার জন্য
export { Doctor } from '../../models/doctor';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  private readonly resource = 'doctors';

  constructor(private readonly api: ApiService) {}

  getDoctors(): Observable<Doctor[]> {
    return this.api.getAll<Doctor>(this.resource);
  }

  getDoctorById(id: number): Observable<Doctor> {
    return this.api.getById<Doctor>(this.resource, id);
  }

  getMyDoctor(): Observable<Doctor> {
    return this.api.getById<Doctor>(this.resource, 'me');
  }

  addDoctor(doctor: Doctor, password: string): Observable<Doctor> {
    return this.api.create<Doctor, { profile: DoctorRequestProfile; password: string }>(
      this.resource, { profile: this.toRequestProfile(doctor), password }
    );
  }

  updateDoctor(id: number, doctor: Doctor): Observable<Doctor> {
    return this.api.update<Doctor, DoctorRequestProfile>(this.resource, id, this.toRequestProfile(doctor));
  }

  deleteDoctor(id: number): Observable<void> {
    return this.api.remove(this.resource, id);
  }

  private toRequestProfile(doctor: Doctor): DoctorRequestProfile {
    const { departmentId, ...profile } = doctor;
    delete profile.department;
    return {
      ...profile,
      department: departmentId == null ? null : { id: departmentId }
    };
  }
}
