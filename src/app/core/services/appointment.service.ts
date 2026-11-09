
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Appointment } from '../../models/appointment';
import { DoctorPatient } from '../../models/doctor-patient';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly resource = 'appointments';

  constructor(private readonly api: ApiService) {}

  getAppointments(): Observable<Appointment[]> {
    return this.api.getAll<Appointment>(this.resource).pipe(map(items => items.map(item => this.normalize(item))));
  }

  getAppointmentById(id: number): Observable<Appointment> {
    return this.api.getById<Appointment>(this.resource, id).pipe(map(item => this.normalize(item)));
  }

  addAppointment(value: Partial<Appointment>): Observable<Appointment> {
    return this.api.create<Appointment>(this.resource, value);
  }

  createPublicAppointment(request: {
    patientName: string;
    email: string;
    phone: string;
    age: number;
    gender: string;
    doctorId: number;
    departmentId?: number;
    appointmentDate: string;
    appointmentTime: string;
    message?: string;
  }): Observable<Appointment> {
    return this.api.create<Appointment>(
      `${this.resource}/public`,
      request
    );
  }

  getMyAppointments(): Observable<Appointment[]> {
    return this.api.getAll<Appointment>(
      `${this.resource}/doctor/my?status=SCHEDULED`
    ).pipe(map(items => items.map(item => this.normalize(item))));
  }

  getMyPatients(): Observable<DoctorPatient[]> {
    return this.api.getResource<Array<{
      patientId: string;
      name: string;
      age: number | null;
      gender?: string;
      bloodGroup?: string;
      phone?: string;
      department?: string;
      appointmentStatus: string;
      lastAppointmentDate?: string;
    }>>(`${this.resource}/doctor/patients`).pipe(
      map(items => (items ?? []).map(item => ({
        id: item.patientId,
        name: item.name,
        age: item.age,
        gender: item.gender,
        bloodGroup: item.bloodGroup,
        phone: item.phone,
        department: item.department,
        status: item.appointmentStatus,
        lastAppointmentDate: item.lastAppointmentDate
      })))
    );
  }

  updateAppointment(
    id: number,
    value: Partial<Appointment>
  ): Observable<Appointment> {
    return this.api.update<Appointment>(this.resource, id, value);
  }

 updateStatus(
  id: number,
  status: 'SCHEDULED' | 'REJECTED' | 'COMPLETED'
): Observable<Appointment> {
  return this.api.patch<Appointment>(
    this.resource,
    `${id}/status?status=${status}`
  ).pipe(map(item => this.normalize(item)));
}
  

  deleteAppointment(id: number): Observable<void> {
    return this.api.remove(this.resource, id);
  }

  private normalize(item: any): Appointment {
    return {
      ...item,
      patientRecordId: item.patientRecordId ?? item.patient?.id,
      doctorId: item.doctorId ?? item.doctor?.id,
      departmentId: item.departmentId ?? item.department?.id ?? item.doctor?.department?.id,
      patientName: item.patientName ?? item.patient?.name ?? '',
      patientPhone: item.patientPhone ?? item.patient?.phone ?? '',
      doctorName: item.doctorName ?? item.doctor?.name ?? '',
      department: typeof item.department === 'string'
        ? item.department
        : item.department?.departmentName ?? item.doctor?.department?.departmentName ?? ''
    } as Appointment;
  }
}
export { Appointment };

