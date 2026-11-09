import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Laboratory, LaboratoryWorkItem, LaboratoryWorkflowFilter, LaboratoryWorkflowUpdate } from '../../models/laboratory';

@Injectable({ providedIn: 'root' })
export class LaboratoryService {
  private readonly resource = 'laboratories';
  constructor(private readonly api: ApiService) {}
  getLaboratoryTests(): Observable<Laboratory[]> { return this.api.getAll<Laboratory>(this.resource); }
  getLaboratoryById(id: number): Observable<Laboratory> { return this.api.getById<Laboratory>(this.resource, id); }
  addLaboratory(value: Partial<Laboratory>): Observable<Laboratory> { return this.api.create<Laboratory>(this.resource, value); }
  updateLaboratory(id: number, value: Partial<Laboratory>): Observable<Laboratory> { return this.api.update<Laboratory>(this.resource, id, value); }
  deleteLaboratory(id: number): Observable<void> { return this.api.remove(this.resource, id); }

  getWorklist(status?: LaboratoryWorkflowFilter): Observable<LaboratoryWorkItem[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.api.getResource<LaboratoryWorkItem[]>(`${this.resource}/worklist${query}`);
  }

  getCompletedReports(): Observable<LaboratoryWorkItem[]> {
    return this.api.getResource<LaboratoryWorkItem[]>(`${this.resource}/reports`);
  }

  updateTest(id: number, value: LaboratoryWorkflowUpdate): Observable<LaboratoryWorkItem> {
    return this.api.patch<LaboratoryWorkItem>(this.resource, `worklist/${id}`, value);
  }
}
