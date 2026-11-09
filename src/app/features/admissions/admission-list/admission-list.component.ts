import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AdmissionService } from '../../../core/services/admission.service';
import { Admission } from '../../../models/admission';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-admission-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admission-list.component.html',
  styleUrl: './admission-list.component.css'
})
export class AdmissionListComponent implements OnInit {

  admissions: Admission[] = [];
  readonly isAdmin: boolean;
  readonly isAccountsStaff: boolean;
  readonly basePath: string;

  constructor(private admissionService: AdmissionService, authService: AuthService) {
    this.isAdmin = authService.isAdmin();
    this.isAccountsStaff = authService.hasRole('ACCOUNTS_STAFF');
    this.basePath = this.isAccountsStaff ? '/accounts/admissions'
      : authService.hasRole('NURSE') ? '/nurse/admissions' : '/admin/admissions';
  }

  ngOnInit(): void {
    this.loadAdmissions();
  }

  loadAdmissions(): void {
    this.admissionService.getAdmissions().subscribe({
      next: admissions => this.admissions = admissions,
      error: error => console.error('ভর্তি তালিকা লোড করা যায়নি', error)
    });
  }

  deleteAdmission(id: number): void {

    if (!this.isAdmin) return;

    if (confirm('Are you sure you want to delete this admission?')) {

      this.admissionService.deleteAdmission(id).subscribe({
        next: () => { this.loadAdmissions(); alert('ভর্তির রেকর্ড মুছে ফেলা হয়েছে।'); },
        error: error => console.error('ভর্তির রেকর্ড মুছতে ব্যর্থ', error)
      });
    }
  }
}
