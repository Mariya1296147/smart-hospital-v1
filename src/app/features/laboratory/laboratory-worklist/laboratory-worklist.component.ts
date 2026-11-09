import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LaboratoryService } from '../../../core/services/laboratory.service';
import { LaboratoryWorkItem, LaboratoryWorkflowFilter, LaboratoryWorkflowStatus } from '../../../models/laboratory';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { defer, finalize, timeout } from 'rxjs';

type WorklistView = 'PENDING' | 'IN_PROGRESS' | 'SAMPLE_COLLECTION' | 'PROCESSING' | 'RESULT_ENTRY' | 'REPORTS';
interface PrescriptionGroup {
  prescriptionId: number;
  patientName: string;
  patientCode: string;
  patientPhone?: string;
  doctorName: string;
  departmentName: string;
  diagnosis?: string;
  tests: LaboratoryWorkItem[];
}

@Component({
  selector: 'app-laboratory-worklist',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './laboratory-worklist.component.html',
  styleUrl: './laboratory-worklist.component.css'
})
export class LaboratoryWorklistComponent implements OnInit {
  view: WorklistView = 'PENDING';
  items: LaboratoryWorkItem[] = [];
  resultDrafts: Record<number, string> = {};
  remarksDrafts: Record<number, string> = {};
  loading = false;
  busyId: number | null = null;
  errorMessage = '';
  successMessage = '';
  readonly isDoctor: boolean;
  private readonly destroyRef = inject(DestroyRef);

  constructor(private readonly route: ActivatedRoute, private readonly laboratory: LaboratoryService, auth: AuthService) {
    this.isDoctor = auth.hasRole('DOCTOR');
  }

  ngOnInit(): void {
    this.view = (this.route.snapshot.data['workflowView'] as WorklistView) || 'PENDING';
    this.load();
  }

  get title(): string {
    if (this.isDoctor) return 'Completed Laboratory Reports';
    return ({ PENDING: 'Pending Tests', IN_PROGRESS: 'In Progress', SAMPLE_COLLECTION: 'Sample Collection', PROCESSING: 'Test Processing', RESULT_ENTRY: 'Result Entry', REPORTS: 'Completed Reports' } as const)[this.view];
  }

  get subtitle(): string {
    return this.view === 'REPORTS'
      ? this.isDoctor ? 'Saved results and remarks for tests ordered by you.' : 'Completed tests with saved results and remarks.'
      : 'Each prescribed test appears once. Laboratory work can proceed while Accounts billing is handled.';
  }

  get groups(): PrescriptionGroup[] {
    const grouped = new Map<number, PrescriptionGroup>();
    for (const item of this.items) {
      let group = grouped.get(item.prescriptionId);
      if (!group) {
        group = { prescriptionId: item.prescriptionId, patientName: item.patientName, patientCode: item.patientCode,
          patientPhone: item.patientPhone, doctorName: item.doctorName, departmentName: item.departmentName, diagnosis: item.diagnosis, tests: [] };
        grouped.set(item.prescriptionId, group);
      }
      group.tests.push(item);
    }
    return [...grouped.values()];
  }

  load(): void {
    if (this.loading) return;
    this.loading = true;
    this.errorMessage = '';
    defer(() => this.view === 'REPORTS'
      ? this.laboratory.getCompletedReports()
      : this.laboratory.getWorklist(this.statusForView(this.view))).pipe(
      timeout({ first: 20000 }),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading = false)
    ).subscribe({
      next: items => {
        if (!Array.isArray(items)) {
          this.items = [];
          this.errorMessage = 'The laboratory service returned an unexpected worklist response. Please retry.';
          return;
        }
        this.items = items;
        this.items.forEach(item => {
          this.resultDrafts[item.id] = item.result || '';
          this.remarksDrafts[item.id] = item.remarks || '';
        });
      },
      error: error => {
        this.items = [];
        this.errorMessage = this.loadErrorMessage(error);
      }
    });
  }

  collectSample(item: LaboratoryWorkItem): void {
    this.update(item, { status: 'SAMPLE_COLLECTED', sampleDate: this.todayLocal() }, 'Sample collected.');
  }

  startProcessing(item: LaboratoryWorkItem): void {
    this.update(item, { status: 'PROCESSING' }, 'Test moved to processing.');
  }

  saveResult(item: LaboratoryWorkItem): void {
    const result = (this.resultDrafts[item.id] || '').trim();
    const remarks = (this.remarksDrafts[item.id] || '').trim();
    if (!result) {
      this.errorMessage = `Enter a result for ${item.testName} before saving.`;
      this.successMessage = '';
      return;
    }
    this.update(item, { status: 'COMPLETED', result, remarks }, 'Result and remarks saved; report completed.');
  }

  statusLabel(status: LaboratoryWorkflowStatus): string {
    return ({ PENDING: 'Pending', SAMPLE_COLLECTED: 'Sample collected', PROCESSING: 'Processing', COMPLETED: 'Completed' })[status];
  }

  get canManageTests(): boolean { return !this.isDoctor && this.view !== 'REPORTS'; }
  get showSampleCollectionAction(): boolean { return this.view === 'SAMPLE_COLLECTION' || this.view === 'IN_PROGRESS'; }
  get showProcessingAction(): boolean { return this.view === 'PROCESSING' || this.view === 'IN_PROGRESS'; }
  get showResultAction(): boolean { return this.view === 'RESULT_ENTRY' || this.view === 'IN_PROGRESS'; }

  private statusForView(view: WorklistView): LaboratoryWorkflowFilter {
    switch (view) {
      case 'SAMPLE_COLLECTION': return 'PENDING';
      case 'PROCESSING': return 'SAMPLE_COLLECTED';
      case 'RESULT_ENTRY': return 'PROCESSING';
      case 'IN_PROGRESS': return 'IN_PROGRESS';
      default: return 'PENDING';
    }
  }

  private update(item: LaboratoryWorkItem, change: { status: LaboratoryWorkflowStatus; sampleDate?: string; result?: string; remarks?: string }, success: string): void {
    this.busyId = item.id;
    this.errorMessage = '';
    this.successMessage = '';
    this.laboratory.updateTest(item.id, change).subscribe({
      next: () => {
        this.busyId = null;
        this.successMessage = success;
        this.load();
      },
      error: error => {
        this.busyId = null;
        this.errorMessage = error?.error?.message || 'The test could not be updated.';
      }
    });
  }

  private todayLocal(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  private loadErrorMessage(error: any): string {
    if (error?.name === 'TimeoutError') return 'The laboratory worklist took too long to respond. Check the connection and retry.';
    if (error?.status === 403) return 'Your account does not have permission to view the laboratory worklist.';
    if (error?.status === 0) return 'The laboratory service is unavailable. Check the server connection and retry.';
    const body = error?.error;
    if (typeof body === 'string' && body.trim()) return body;
    return body?.message || body?.detail || body?.title || error?.statusText || 'Laboratory worklist could not be loaded. Please retry.';
  }
}
