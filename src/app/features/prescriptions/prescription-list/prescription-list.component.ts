import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { Prescription } from '../../../models/prescription';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentService } from '../../../core/services/appointment.service';

@Component({
  selector: 'app-prescription-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './prescription-list.component.html'
})
export class PrescriptionListComponent implements OnInit {

  prescriptions: Prescription[] = [];
  isLoading = false;
  errorMessage = '';
  completingAppointmentId: number | null = null;
  printingPrescriptionId: number | null = null;
  readonly isAdmin: boolean;
  readonly basePath: string;

  constructor(
    private prescriptionService: PrescriptionService,
    private router: Router,
    authService: AuthService,
    private appointmentService: AppointmentService
  ) {
    this.isAdmin = authService.isAdmin();
    this.basePath = this.isAdmin ? '/admin/prescriptions' : '/doctor/prescriptions';
  }

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  loadPrescriptions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.prescriptionService.getPrescriptions().subscribe({
      next: (data) => {
        this.prescriptions = data || [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load prescriptions.';
        this.isLoading = false;
      }
    });
  }

  viewPrescription(id: number): void {
    this.router.navigate([this.basePath, 'view', id]);
  }

  printPrescription(id: number): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.errorMessage = 'Allow pop-ups to open the prescription PDF for printing.';
      return;
    }
    this.printingPrescriptionId = id;
    this.errorMessage = '';
    this.prescriptionService.getPrescriptionPdf(id).subscribe({
      next: pdf => {
        const pdfUrl = URL.createObjectURL(pdf);
        printWindow.location.href = pdfUrl;
        window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000);
        this.printingPrescriptionId = null;
      },
      error: () => {
        printWindow.close();
        this.errorMessage = 'Failed to generate the prescription PDF.';
        this.printingPrescriptionId = null;
      }
    });
  }

  editPrescription(id: number): void {
    if (this.isAdmin) this.router.navigate([this.basePath, 'edit', id]);
  }

  deletePrescription(id: number): void {
    if (!this.isAdmin) return;
    if (!confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    this.prescriptionService.deletePrescription(id).subscribe({
      next: () => {
        this.loadPrescriptions();
      },
      error: () => {
        this.errorMessage = 'Failed to delete prescription.';
      }
    });
  }

  completeVisit(prescription: Prescription): void {
    const appointmentId = prescription.appointmentId;
    if (this.isAdmin || appointmentId == null || prescription.appointmentStatus === 'COMPLETED') return;
    this.completingAppointmentId = appointmentId;
    this.errorMessage = '';
    this.appointmentService.updateStatus(appointmentId, 'COMPLETED').subscribe({
      next: () => {
        prescription.appointmentStatus = 'COMPLETED';
        this.completingAppointmentId = null;
      },
      error: error => {
        this.errorMessage = error?.error?.message || 'Could not complete this visit.';
        this.completingAppointmentId = null;
      }
    });
  }
}
