import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TestCatalogService } from '../../core/services/test-catalog.service';
import { TestCatalogItem } from '../../models/prescription';

@Component({
  selector: 'app-test-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div><h2>Test Catalog</h2><p class="text-muted mb-0">Manage available prescription tests and prices.</p></div>
        <button class="btn btn-primary" (click)="startNew()">Add Test</button>
      </div>
      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
      <div *ngIf="editing" class="card shadow-sm mb-4">
        <div class="card-header">{{ editing.id ? 'Edit Test' : 'Add Test' }}</div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3"><label class="form-label">Test Code</label><input class="form-control" [(ngModel)]="editing.code"></div>
            <div class="col-md-4"><label class="form-label">Test Name</label><input class="form-control" [(ngModel)]="editing.name"></div>
            <div class="col-md-2"><label class="form-label">Price</label><input type="number" min="0" step="0.01" class="form-control" [(ngModel)]="editing.price"></div>
            <div class="col-md-3 d-flex align-items-end"><label class="form-check"><input type="checkbox" class="form-check-input" [(ngModel)]="editing.active"> Active</label></div>
            <div class="col-12"><label class="form-label">Description (optional)</label><textarea class="form-control" rows="2" [(ngModel)]="editing.description"></textarea></div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-3"><button class="btn btn-light" (click)="editing = null">Cancel</button><button class="btn btn-primary" (click)="save()" [disabled]="saving">{{ saving ? 'Saving…' : 'Save Test' }}</button></div>
        </div>
      </div>
      <div class="card shadow-sm"><div class="table-responsive"><table class="table table-hover align-middle mb-0">
        <thead class="table-light"><tr><th>Code</th><th>Name</th><th>Description</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody><tr *ngFor="let test of tests"><td>{{ test.code }}</td><td>{{ test.name }}</td><td>{{ test.description || '—' }}</td><td>{{ test.price | number:'1.2-2' }}</td><td>{{ test.active ? 'Active' : 'Inactive' }}</td><td><button class="btn btn-sm btn-outline-primary me-2" (click)="edit(test)">Edit</button><button class="btn btn-sm btn-outline-danger" (click)="remove(test)">Delete</button></td></tr><tr *ngIf="tests.length === 0"><td colspan="6" class="text-center text-muted py-4">No catalog tests found.</td></tr></tbody>
      </table></div></div>
    </div>`
})
export class TestCatalogComponent implements OnInit {
  tests: TestCatalogItem[] = [];
  editing: TestCatalogItem | null = null;
  saving = false;
  error = '';
  constructor(private readonly service: TestCatalogService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.service.getTests().subscribe({ next: data => this.tests = data ?? [], error: () => this.error = 'Could not load the test catalog.' }); }
  startNew(): void { this.editing = { code: '', name: '', description: '', price: 0, active: true }; this.error = ''; }
  edit(test: TestCatalogItem): void { this.editing = { ...test }; this.error = ''; }
  save(): void {
    if (!this.editing || !this.editing.code.trim() || !this.editing.name.trim() || this.editing.price < 0) { this.error = 'Enter a code, name, and a non-negative price.'; return; }
    this.saving = true;
    const request = this.editing.id ? this.service.updateTest(this.editing.id, this.editing) : this.service.addTest(this.editing);
    request.subscribe({ next: () => { this.saving = false; this.editing = null; this.load(); }, error: e => { this.saving = false; this.error = e?.error?.message || 'Could not save the test.'; } });
  }
  remove(test: TestCatalogItem): void {
    if (!test.id || !confirm(`Delete ${test.name}?`)) return;
    this.service.deleteTest(test.id).subscribe({ next: () => this.load(), error: () => this.error = 'Could not delete the test.' });
  }
}
