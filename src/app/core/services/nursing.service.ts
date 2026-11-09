import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Nurse } from '../../models/nursing';

@Injectable({ providedIn: 'root' })
export class NurseService {
  private readonly resource = 'nurses';
  constructor(private readonly api: ApiService) {}
  getNurses(): Observable<Nurse[]> { return this.api.getAll<Nurse>(this.resource); }
  getMyProfile(): Observable<Nurse> { return this.api.getResource<Nurse>(`${this.resource}/me`); }
  getNurseById(id: number): Observable<Nurse> { return this.api.getById<Nurse>(this.resource, id); }
  addNurse(value: Partial<Nurse>, password: string): Observable<Nurse> {
    return this.api.create<Nurse, { profile: Partial<Nurse>; password: string }>(
      this.resource, { profile: value, password }
    );
  }
  updateNurse(id: number, value: Partial<Nurse>): Observable<Nurse> { return this.api.update<Nurse>(this.resource, id, value); }
  deleteNurse(id: number): Observable<void> { return this.api.remove(this.resource, id); }
}
