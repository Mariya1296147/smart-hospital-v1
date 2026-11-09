import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DashboardSummary } from '../../models/dashboard';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly api: ApiService) {}

  getSummary(): Observable<DashboardSummary> {
    return this.api.getResource<DashboardSummary>('dashboard/data');
  }
}
