import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Department } from '../../models/department';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private readonly resource = 'departments';

  constructor(private readonly api: ApiService) {}

  getAll(): Observable<Department[]> {
    return this.api.getAll<Department>(this.resource);
  }

  getById(id: number): Observable<Department> {
    return this.api.getById<Department>(this.resource, id);
  }

  create(department: Partial<Department>): Observable<Department> {
    return this.api.create<Department>(this.resource, department);
  }

  update(
    id: number,
    department: Partial<Department>
  ): Observable<Department> {
    return this.api.update<Department>(this.resource, id, department);
  }

  delete(id: number): Observable<void> {
    return this.api.remove(this.resource, id);
  }
}
