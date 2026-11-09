import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Discharge } from '../../models/discharge';

@Injectable({ providedIn: 'root' })
export class DischargeService {
  private readonly resource = 'discharges';
  constructor(private readonly api: ApiService) {}
  getDischarges(): Observable<Discharge[]> { return this.api.getAll<Discharge>(this.resource); }
  getDischargeById(id: number): Observable<Discharge> { return this.api.getById<Discharge>(this.resource, id); }
  addDischarge(value: Partial<Discharge>): Observable<Discharge> { return this.api.create<Discharge>(this.resource, value); }
  updateDischarge(id: number, value: Partial<Discharge>): Observable<Discharge> { return this.api.update<Discharge>(this.resource, id, value); }
  deleteDischarge(id: number): Observable<void> { return this.api.remove(this.resource, id); }
}
