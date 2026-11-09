import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { Prescription } from '../../../models/prescription';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-prescription-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './prescription-view.component.html'
})
export class PrescriptionViewComponent implements OnInit {

  prescription: Prescription | null = null;

  isLoading = false;
  errorMessage = '';
  printing = false;
  readonly isAdmin: boolean;
  readonly basePath: string;

  constructor(
    private prescriptionService: PrescriptionService,
    private route: ActivatedRoute,
    private router: Router,
    authService: AuthService
  ) {
    this.isAdmin = authService.isAdmin();
    this.basePath = this.isAdmin ? '/admin/prescriptions' : '/doctor/prescriptions';
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || Number.isNaN(id)) {
      this.errorMessage = 'Invalid prescription ID.';
      return;
    }

    this.loadPrescription(id);
  }

  loadPrescription(id: number): void {
    this.isLoading = true;

    this.prescriptionService.getPrescriptionById(id).subscribe({
      next: (data) => {
        this.prescription = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load prescription details.';
        this.isLoading = false;
      }
    });
  }

  editPrescription(): void {
    if (this.isAdmin && this.prescription) {
      this.router.navigate([
        this.basePath, 'edit',
        this.prescription.id
      ]);
    }
  }

  goBack(): void {
    this.router.navigate([this.basePath]);
  }

  printPrescription(): void {
    if (!this.prescription) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.errorMessage = 'Allow pop-ups to open the prescription PDF for printing.';
      return;
    }
    this.printing = true;
    this.errorMessage = '';
    this.prescriptionService.getPrescriptionPdf(this.prescription.id).subscribe({
      next: pdf => {
        const pdfUrl = URL.createObjectURL(pdf);
        printWindow.location.href = pdfUrl;
        window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000);
        this.printing = false;
      },
      error: () => {
        printWindow.close();
        this.errorMessage = 'Failed to generate the prescription PDF.';
        this.printing = false;
      }
    });
  }
}
