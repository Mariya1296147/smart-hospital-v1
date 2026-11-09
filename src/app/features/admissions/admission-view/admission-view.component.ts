import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

import { AdmissionService } from '../../../core/services/admission.service';
import { Admission } from '../../../models/admission';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-admission-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admission-view.component.html',
  styleUrl: './admission-view.component.css'
})
export class AdmissionViewComponent implements OnInit {

  admission!: Admission;
  readonly basePath: string;
  readonly canEdit: boolean;
  isDischarging = false;

  constructor(
    private admissionService: AdmissionService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.basePath = authService.hasRole('ACCOUNTS_STAFF') ? '/accounts/admissions'
      : authService.hasRole('NURSE') ? '/nurse/admissions' : '/admin/admissions';
    this.canEdit = authService.isAdmin() || authService.hasRole('ACCOUNTS_STAFF');
  }

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.admissionService.getAdmissionById(id).subscribe({
      next: data => this.admission = data,
      error: error => console.error('ভর্তির তথ্য পাওয়া যায়নি', error)
    });

  }

  get canDischarge(): boolean {
    return !!this.admission && ['ADMITTED', 'ACTIVE', 'IN_PROGRESS'].includes(this.admission.status.toUpperCase())
      && (this.authService.isAdmin() || this.authService.hasRole('ACCOUNTS_STAFF') || this.authService.hasRole('NURSE'));
  }

  get canEditAdmission(): boolean {
    return this.canEdit && (!this.authService.hasRole('ACCOUNTS_STAFF')
      || this.admission?.status?.toUpperCase() === 'PENDING');
  }

  discharge(): void {
    if (!this.admission?.id || !this.canDischarge || this.isDischarging) return;
    if (!confirm(`Discharge ${this.admission.patientName} and release the assigned bed?`)) return;
    this.isDischarging = true;
    this.admissionService.dischargeAdmission(this.admission.id).subscribe({
      next: updated => { this.admission = updated; this.isDischarging = false; },
      error: error => { this.isDischarging = false; alert(error?.error?.message || 'Could not discharge this patient.'); }
    });
  }

}
