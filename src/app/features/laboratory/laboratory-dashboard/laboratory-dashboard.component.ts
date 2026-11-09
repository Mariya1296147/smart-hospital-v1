
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LaboratoryService } from '../../../core/services/laboratory.service';
import { LaboratoryWorkItem } from '../../../models/laboratory';
import { finalize, timeout } from 'rxjs';

@Component({
  selector: 'app-laboratory-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './laboratory-dashboard.component.html',
  styleUrl: './laboratory-dashboard.component.css'
})
export class LaboratoryDashboardComponent implements OnInit {
  tests: LaboratoryWorkItem[] = [];
  private allTests: LaboratoryWorkItem[] = [];
  loading = false;
  errorMessage = '';

  constructor(private readonly laboratory: LaboratoryService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.laboratory.getWorklist().pipe(
      timeout({ first: 20000 }),
      finalize(() => this.loading = false)
    ).subscribe({
      next: items => {
        this.allTests = items ?? [];
        this.tests = this.allTests.slice().sort((a, b) => b.prescriptionId - a.prescriptionId).slice(0, 5);
      },
      error: error => {
        this.allTests = [];
        this.tests = [];
        this.errorMessage = error?.name === 'TimeoutError'
          ? 'The laboratory worklist took too long to respond. Check the connection and try again.'
          : error?.status === 403
            ? 'Your account does not have permission to view the laboratory dashboard.'
            : error?.status === 0
              ? 'The laboratory service is unavailable. Check that the server is running, then try again.'
              : 'The laboratory worklist could not be loaded. Please try again.';
        console.error('Laboratory dashboard worklist failed to load', error);
      }
    });
  }

  metric(name: string): number {
    if (name === 'totalLabTests' || name === 'labTestsToday') return this.allTests.length;
    if (name === 'pendingLabTests') return this.allTests.filter(test => test.status === 'PENDING').length;
    if (name === 'inProgressLabTests') return this.allTests.filter(test => ['SAMPLE_COLLECTED', 'PROCESSING'].includes(test.status)).length;
    return this.allTests.filter(test => test.status === 'COMPLETED').length;
  }

  get pendingTests(): LaboratoryWorkItem[] { return this.allTests.filter(test => test.status === 'PENDING').slice(0, 5); }
  get inProgressTests(): LaboratoryWorkItem[] { return this.allTests.filter(test => ['SAMPLE_COLLECTED', 'PROCESSING'].includes(test.status)).slice(0, 5); }
  get completedTests(): LaboratoryWorkItem[] { return this.allTests.filter(test => test.status === 'COMPLETED').slice(0, 5); }

  statusClass(status: string): string { return `status ${status.toLowerCase() === 'sample_collected' ? 'processing' : status.toLowerCase()}`; }

}
