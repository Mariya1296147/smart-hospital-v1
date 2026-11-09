
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { CompletedDoctorVisit, Prescription, PrescriptionWriteRequest } from '../../models/prescription';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {

  private readonly resource = 'prescriptions';

  constructor(private readonly api: ApiService, private readonly http: HttpClient) {}

  getPrescriptions(): Observable<Prescription[]> {
    return this.api.getAll<Prescription>(this.resource);
  }

  getPrescriptionById(id: number): Observable<Prescription> {
    return this.api.getById<Prescription>(this.resource, id);
  }

  getPrescriptionPdf(id: number): Observable<Blob> {
    return this.http.get(`${environment.apiBaseUrl}/${this.resource}/${id}/pdf`, { responseType: 'blob' });
  }

  getCompletedDoctorVisits(): Observable<CompletedDoctorVisit[]> {
    return this.api.getResource<CompletedDoctorVisit[]>(`${this.resource}/doctor-visits`);
  }

  addPrescription(value: PrescriptionWriteRequest): Observable<Prescription> {
    return this.api.create<Prescription, PrescriptionWriteRequest>(this.resource, value);
  }

  updatePrescription(
    id: number,
    value: PrescriptionWriteRequest
  ): Observable<Prescription> {
    return this.api.update<Prescription, PrescriptionWriteRequest>(this.resource, id, value);
  }

  deletePrescription(id: number): Observable<void> {
    return this.api.remove(this.resource, id);
  }
}
