import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Consultation } from '../../models/consultation';

@Injectable({ providedIn: 'root' })
export class ConsultationService {
  private readonly resource = 'consultations';
  constructor(private readonly api: ApiService) { }
  getConsultations(): Observable<Consultation[]> {
    return this.api.getAll<any>(this.resource).pipe(map(items => (items ?? []).map(item => this.toForm(item))));
  }
  getConsultationById(id: number): Observable<Consultation> {
    return this.api.getById<any>(this.resource, id).pipe(map(item => this.toForm(item)));
  }
  addConsultation(value: Partial<Consultation>): Observable<Consultation> {
    return this.api.create<any>(this.resource, this.toPayload(value)).pipe(map(item => this.toForm(item)));
  }
  updateConsultation(id: number, value: Partial<Consultation>): Observable<Consultation> {
    return this.api.update<any>(this.resource, id, this.toPayload(value)).pipe(map(item => this.toForm(item)));
  }
  deleteConsultation(id: number): Observable<void> { return this.api.remove(this.resource, id); }

  private toPayload(value: Partial<Consultation>): Record<string, unknown> {
    return {
      consultationId: value.consultationId,
      patient: value.patientRecordId ? { id: value.patientRecordId } : null,
      appointment: value.appointmentRecordId ? { id: value.appointmentRecordId } : null,
      doctor: value.doctorId ? { id: value.doctorId } : null,
      department: value.departmentId ? { id: value.departmentId } : null,
      date: value.date,
      time: value.time,
      type: value.type,
      symptoms: value.symptoms,
      diagnosis: value.diagnosis,
      notes: value.notes,
      status: value.status?.toUpperCase()
    };
  }

  private toForm(item: any): Consultation {
    const patient = item.patient ?? {};
    const doctor = item.doctor ?? {};
    const department = item.department ?? {};
    const status = String(item.status ?? 'PENDING').toLowerCase();

    return {
      id: item.id,
      consultationId: item.consultationId ?? '',
      patientName: patient.name ?? item.patientName ?? '',
      patientId: patient.patientId ?? (typeof item.patientId === 'string' ? item.patientId : ''),
      patientRecordId: patient.id ?? (typeof item.patientId === 'number' ? item.patientId : null),
      appointmentRecordId: item.appointment?.id ?? item.appointmentId ?? null,
      age: patient.age ?? item.age ?? 0,
      gender: patient.gender ?? item.gender ?? 'Other',
      doctorName: doctor.name ?? item.doctorName ?? '',
      doctorId: doctor.id ?? item.doctorId ?? null,
      department: department.departmentName ?? item.departmentName ?? (typeof item.department === 'string' ? item.department : ''),
      departmentId: department.id ?? item.departmentId ?? null,
      date: item.date ?? '',
      time: item.time?.slice?.(0, 5) ?? item.time ?? '',
      type: item.type ?? '',
      symptoms: item.symptoms ?? '',
      diagnosis: item.diagnosis ?? '',
      notes: item.notes ?? '',
      status: status === 'completed' ? 'Completed' : status === 'cancelled' ? 'Cancelled' : 'Pending'
    };
  }
}
