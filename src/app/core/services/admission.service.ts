import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Admission } from '../../models/admission';

@Injectable({ providedIn: 'root' })
export class AdmissionService {
  private readonly resource = 'admissions';
  constructor(private readonly api: ApiService) {}
  getAdmissions(): Observable<Admission[]> { return this.api.getAll<Admission>(this.resource); }
  getAdmissionById(id: number): Observable<Admission> { return this.api.getById<Admission>(this.resource, id); }
  addAdmission(value: Partial<Admission>): Observable<Admission> { return this.api.create<Admission>(this.resource, value); }
  updateAdmission(id: number, value: Partial<Admission>): Observable<Admission> { return this.api.update<Admission>(this.resource, id, value); }
  deleteAdmission(id: number): Observable<void> { return this.api.remove(this.resource, id); }
  dischargeAdmission(id: number): Observable<Admission> { return this.api.patch<Admission>(this.resource, `${id}/discharge`); }
}
