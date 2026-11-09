
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { Patient } from '../../models/patient';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  private apiUrl = `${environment.apiBaseUrl}/patients`;

  constructor(private http: HttpClient) { }

  // Get all patients
  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.apiUrl).pipe(map(items => items.map(item => this.normalize(item))));
  }

  // Get single patient
  getPatientById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`).pipe(map(item => this.normalize(item)));
  }

  getMyPatient(): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/me`).pipe(map(item => this.normalize(item)));
  }

  // Add patient
  addPatient(patient: Partial<Patient>): Observable<Patient> {

    const firstName = patient.firstName?.trim() || '';
    const lastName = patient.lastName?.trim() || '';

    const fullName =
      `${firstName} ${lastName}`.trim() ||
      patient.name?.trim() ||
      '';

    const payload = {
      ...patient,
      patientId: patient.patientId || `P-${Date.now()}`,
      firstName,
      lastName,
      name: fullName,
      email: patient.email?.trim() || '',
      status: patient.status || 'Active'
    };

    return this.http.post<Patient>(this.apiUrl, payload).pipe(map(item => this.normalize(item)));
  }

  // Update patient
  updatePatient(
    id: number,
    updatedPatient: Partial<Patient>
  ): Observable<Patient> {

    return this.getPatientById(id).pipe(
      switchMap(existingPatient => {

        const firstName =
          updatedPatient.firstName ??
          existingPatient.firstName ??
          '';

        const lastName =
          updatedPatient.lastName ??
          existingPatient.lastName ??
          '';

        const fullName =
          `${firstName} ${lastName}`.trim() ||
          updatedPatient.name?.trim() ||
          existingPatient.name;

        const payload: Patient = {
          ...existingPatient,
          ...updatedPatient,

          id: existingPatient.id,
          patientId: existingPatient.patientId,

          firstName,
          lastName,
          name: fullName,

          email:
            updatedPatient.email?.trim() ||
            existingPatient.email,

          status:
            updatedPatient.status ??
            existingPatient.status ??
            'Active'
        };

        return this.http.put<Patient>(
          `${this.apiUrl}/${id}`,
          payload
        ).pipe(map(item => this.normalize(item)));
      })
    );
  }

  // Delete patient
  deletePatient(id: number): Observable<string> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { responseType: 'text' }
    );
  }

  private normalize(patient: any): Patient {
    return {
      ...patient,

      age: patient.age ?? null,
      gender: patient.gender ?? '',

      department:
        typeof patient.department === 'string'
          ? patient.department
          : patient.department?.departmentName ||
          patient.departmentRef?.departmentName ||
          '',

      doctor:
        typeof patient.doctor === 'string'
          ? patient.doctor
          : patient.doctor?.name ||
          patient.doctorRef?.name ||
          ''
    } as Patient;
  }
}
