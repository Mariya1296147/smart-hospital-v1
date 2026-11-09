import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { NursingNoteRecord, VitalSignRecord } from '../../models/nurse-care';

export interface VitalSignRequest {
  patientId: number;
  temperatureC?: number | null;
  pulseBpm?: number | null;
  respiratoryRate?: number | null;
  systolicBp?: number | null;
  diastolicBp?: number | null;
  oxygenSaturation?: number | null;
}

@Injectable({ providedIn: 'root' })
export class NurseCareService {
  constructor(private readonly api: ApiService) {}
  getVitalSigns(): Observable<VitalSignRecord[]> { return this.api.getResource<VitalSignRecord[]>('nurse-care/vitals'); }
  addVitalSigns(value: VitalSignRequest): Observable<VitalSignRecord> { return this.api.create<VitalSignRecord, VitalSignRequest>('nurse-care/vitals', value); }
  getNursingNotes(): Observable<NursingNoteRecord[]> { return this.api.getResource<NursingNoteRecord[]>('nurse-care/notes'); }
  addNursingNote(value: { patientId: number; note: string }): Observable<NursingNoteRecord> { return this.api.create<NursingNoteRecord, { patientId: number; note: string }>('nurse-care/notes', value); }
}
