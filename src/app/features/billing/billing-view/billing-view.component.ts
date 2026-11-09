import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';

import { BillingService } from '../../../core/services/billing.service';
import { Billing, BillingPayment, BillingPaymentRequest } from '../../../models/billing';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-billing-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './billing-view.component.html',
  styleUrl: './billing-view.component.css'
})
export class BillingViewComponent implements OnInit {

  bill: Billing | undefined;
  readonly isAdmin: boolean;
  private readonly isReceptionist: boolean;
  private readonly isAccountsStaff: boolean;
  readonly basePath: string;
  payments: BillingPayment[] = [];
  payment: BillingPaymentRequest = { amount: 0, paymentMethod: 'Cash' };
  paymentError = '';
  isRecordingPayment = false;

  get canCollectPayment(): boolean {
    if (!this.bill) return false;
    return this.isDoctorVisit(this.bill) ? this.isReceptionist : this.isAdmin || this.isAccountsStaff;
  }

  constructor(
    private billingService: BillingService,
    private route: ActivatedRoute,
    private router: Router,
    authService: AuthService
  ) {
    this.isAdmin = authService.isAdmin();
    this.isReceptionist = authService.hasRole('RECEPTIONIST');
    this.isAccountsStaff = authService.hasRole('ACCOUNTS_STAFF');
    this.basePath = this.isAdmin ? '/admin/billing'
      : authService.hasRole('ACCOUNTS_STAFF') ? '/accounts/billing' : '/reception/billing';
  }

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.loadDetails(id);
  }

  private loadDetails(id: number): void {
    this.billingService.getBillById(id).subscribe({
      next: bill => {
        if (this.isDoctorVisit(bill) !== this.isReceptionist) {
          alert('This invoice is not available in your billing workspace.');
          this.router.navigate([this.basePath]);
          return;
        }
        this.bill = bill;
        this.payment.amount = this.amountDue;
        this.billingService.getPayments(id).subscribe({ next: payments => this.payments = payments ?? [] });
      },
      error: () => { alert('ইনভয়েস পাওয়া যায়নি।'); this.router.navigate([this.basePath]); }
    });
  }

  private isDoctorVisit(bill: Billing): boolean {
    return !!bill.appointmentId || !!bill.appointment?.id
      || !!bill.items?.some(item => item.serviceCategory?.toUpperCase() === 'DOCTOR_VISIT')
      || /^doctor visits?\b/i.test(bill.serviceName ?? '');
  }

  get paidAmount(): number {
    return Number(this.bill?.paidAmount ?? (this.bill?.paymentStatus === 'Paid' ? this.bill.totalAmount : 0));
  }

  get amountDue(): number {
    return Math.max(0, Number(this.bill?.totalAmount ?? 0) - this.paidAmount);
  }

  get serviceItems() {
    if (this.bill?.items?.length) return this.bill.items;
    return this.bill?.serviceName ? [{ serviceCategory: 'OTHER', description: this.bill.serviceName, quantity: 1, unitPrice: this.bill.amount, lineTotal: this.bill.amount }] : [];
  }

  downloadInvoice(): void {
    if (this.bill?.id) this.downloadPdf(this.billingService.getInvoicePdf(this.bill.id), `invoice-${this.bill.invoiceId}.pdf`);
  }

  printInvoice(): void {
    if (!this.bill?.id) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Allow pop-ups to open the invoice for printing.');
      return;
    }
    printWindow.document.title = `Invoice ${this.bill.invoiceId}`;
    this.billingService.getInvoicePdf(this.bill.id).subscribe({
      next: pdf => {
        const url = URL.createObjectURL(pdf);
        printWindow.location.href = url;
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: () => {
        printWindow.close();
        alert('Could not generate the invoice PDF.');
      }
    });
  }

  recordPayment(): void {
    if (!this.bill?.id || !this.canCollectPayment || this.isRecordingPayment) return;
    const amount = Number(this.payment.amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > this.amountDue) {
      this.paymentError = `Enter an amount greater than zero and no more than ৳${this.amountDue.toFixed(2)}.`;
      return;
    }
    this.paymentError = '';
    this.isRecordingPayment = true;
    this.billingService.addPayment(this.bill.id, { ...this.payment, amount }).subscribe({
      next: saved => {
        this.isRecordingPayment = false;
        this.payment = { amount: 0, paymentMethod: 'Cash' };
        this.loadDetails(this.bill!.id!);
        this.downloadReceipt(saved);
      },
      error: error => {
        this.isRecordingPayment = false;
        this.paymentError = error?.error?.message || 'Could not record this payment.';
      }
    });
  }

  downloadReceipt(payment: BillingPayment): void {
    if (!this.bill?.id) return;
    this.downloadPdf(this.billingService.getPaymentReceiptPdf(this.bill.id, payment.id), `receipt-${payment.receiptNumber}.pdf`);
  }

  private downloadPdf(request: import('rxjs').Observable<Blob>, filename: string): void {
    request.subscribe({
      next: pdf => {
        const url = URL.createObjectURL(pdf);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      error: () => alert('Could not generate the PDF.')
    });
  }
}
