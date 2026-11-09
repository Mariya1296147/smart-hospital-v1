import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface WardOption { id: number; wardName: string; wardNumber?: string; wardType?: string; capacity?: number; department?: any; }
export interface BedOption { id: number; bedNumber: string; bedType?: string | null; status: string; wardId?: number | null; ward?: WardOption | number | null; }

@Injectable({ providedIn: 'root' })
export class FacilityService {
  constructor(private readonly api: ApiService) {}
  getWards(): Observable<WardOption[]> { return this.api.getAll<WardOption>('wards'); }
  getBeds(): Observable<BedOption[]> { return this.api.getAll<BedOption>('beds'); }
  getAvailableWards(): Observable<WardOption[]> { return this.api.getAll<WardOption>('wards/available'); }
  getAvailableBeds(wardId: number): Observable<BedOption[]> {
    return this.api.getAll<BedOption>(`beds/available?wardId=${encodeURIComponent(wardId)}`);
  }
  createWard(value: Record<string, unknown>): Observable<WardOption> {
    return this.api.create<WardOption, Record<string, unknown>>('wards', value);
  }
  updateWard(id: number, value: Record<string, unknown>): Observable<WardOption> {
    return this.api.update<WardOption, Record<string, unknown>>('wards', id, value);
  }
  deleteWard(id: number): Observable<void> { return this.api.remove('wards', id); }
  createBed(value: Record<string, unknown>): Observable<BedOption> {
    return this.api.create<BedOption, Record<string, unknown>>('beds', value);
  }
  updateBed(id: number, value: Record<string, unknown>): Observable<BedOption> {
    return this.api.update<BedOption, Record<string, unknown>>('beds', id, value);
  }
  deleteBed(id: number): Observable<void> { return this.api.remove('beds', id); }
}
