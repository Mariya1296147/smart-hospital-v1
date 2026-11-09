import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { BillingService } from '../../../core/services/billing.service';
import { Billing } from '../../../models/billing';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-billing-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './billing-list.component.html',
  styleUrl: './billing-list.component.css'
})
export class BillingListComponent implements OnInit {

  bills: Billing[] = [];
  readonly isAdmin: boolean;
  readonly isReceptionist: boolean;
  readonly basePath: string;
  downloadingId: number | null = null;

  constructor(
    private billingService: BillingService,
    authService: AuthService
  ) {
    this.isAdmin = authService.isAdmin();
    this.isReceptionist = authService.hasRole('RECEPTIONIST');
    this.basePath = this.isAdmin ? '/admin/billing'
      : authService.hasRole('ACCOUNTS_STAFF') ? '/accounts/billing' : '/reception/billing';
  }

  ngOnInit(): void {
    this.loadBills();
  }

  loadBills(): void {
    this.billingService.getBills().subscribe({
      next: bills => this.bills = (bills ?? []).filter(bill => this.isDoctorVisit(bill) === this.isReceptionist),
      error: error => console.error('Error loading bills:', error)
    });
  }

  private isDoctorVisit(bill: Billing): boolean {
    return !!bill.appointmentId || !!bill.appointment?.id
      || !!bill.items?.some(item => item.serviceCategory?.toUpperCase() === 'DOCTOR_VISIT')
      || /^doctor visits?\b/i.test(bill.serviceName ?? '');
  }

  deleteBill(id: number): void {
    if (!this.isAdmin) return;

    if (
      confirm(
        'Are you sure you want to delete this invoice?'
      )
    ) {

      this.billingService.deleteBill(id).subscribe({
        next: () => { this.loadBills(); alert('Invoice deleted successfully.'); },
        error: error => console.error('Error deleting invoice:', error)
      });
    }
  }

  downloadInvoice(bill: Billing): void {
    if (!bill.id || this.downloadingId !== null) return;
    this.downloadingId = bill.id;
    this.billingService.getInvoicePdf(bill.id).subscribe({
      next: pdf => {
        const url = URL.createObjectURL(pdf);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${bill.invoiceId || bill.id}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        this.downloadingId = null;
      },
      error: () => { this.downloadingId = null; alert('Could not download the invoice PDF.'); }
    });
  }

  get totalBills(): number {
    return this.bills.length;
  }

  get totalAmount(): number {
    return this.bills.reduce(
      (total, bill) =>
        total + bill.totalAmount,
      0
    );
  }

  get paidBills(): number {
    return this.bills.filter(
      bill => bill.paymentStatus === 'Paid'
    ).length;
  }

  get pendingBills(): number {
    return this.bills.filter(
      bill => bill.paymentStatus === 'Pending'
    ).length;
  }

  get overdueBills(): number {
    return this.bills.filter(
      bill => bill.paymentStatus === 'Overdue'
    ).length;
  }

  get partiallyPaidBills(): number {
    return this.bills.filter(bill => bill.paymentStatus === 'Partially Paid').length;
  }

}
