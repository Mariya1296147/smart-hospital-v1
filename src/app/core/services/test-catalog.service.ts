import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TestCatalogItem } from '../../models/prescription';

@Injectable({ providedIn: 'root' })
export class TestCatalogService {
  private readonly resource = 'test-catalog';
  constructor(private readonly api: ApiService) {}

  getTests(): Observable<TestCatalogItem[]> {
    return this.api.getAll<TestCatalogItem>(this.resource);
  }
  addTest(value: TestCatalogItem): Observable<TestCatalogItem> {
    return this.api.create<TestCatalogItem>(this.resource, value);
  }
  updateTest(id: number, value: TestCatalogItem): Observable<TestCatalogItem> {
    return this.api.update<TestCatalogItem>(this.resource, id, value);
  }
  deleteTest(id: number): Observable<void> {
    return this.api.remove(this.resource, id);
  }
}
