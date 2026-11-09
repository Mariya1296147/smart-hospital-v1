
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingService } from '../../../core/services/billing.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { Billing } from '../../../models/billing';

@Component({
  selector: 'app-billing-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './billing-dashboard.component.html',
  styleUrl: './billing-dashboard.component.css'
})
export class BillingDashboardComponent {

  // ==============================
  // SUMMARY
  // ==============================

  totalRevenue = 0;
  totalBilling = 0;
  totalPayments = 0;
  pendingAmount = 0;

  totalRefunds = 0;
  totalPatients = 0;
  todayRevenue = 0;
  monthlyRevenue = 0;


  // ==============================
  // BILLING BREAKDOWN
  // ==============================

  billingBreakdown: Array<{ title: string; amount: number; icon: string }> = [];


  // ==============================
  // RECENT TRANSACTIONS
  // ==============================

  recentTransactions: Array<{ invoice: string; patient: string; service: string; amount: number; payment: string; date: string }> = [];


  // ==============================
  // MONTHLY REVENUE
  // ==============================

  monthlyData: Array<{ month: string; amount: number }> = [];
  today = new Date();
  get maxMonthlyAmount(): number { return Math.max(...this.monthlyData.map(item => item.amount), 1); }

  constructor(billing: BillingService, dashboard: DashboardService) {
    dashboard.getSummary().subscribe({ next: summary => this.totalPatients = summary.metrics?.totalPatients ?? 0, error: error => console.error('Dashboard summary failed to load', error) });
    billing.getBills().subscribe({ next: bills => this.applyBills(bills ?? []), error: error => console.error('Bills failed to load', error) });
  }

  private applyBills(bills: Billing[]): void {
    const paid = (bill: Billing) => String(bill.paymentStatus).toUpperCase() === 'PAID';
    this.totalBilling = bills.reduce((sum, bill) => sum + Number(bill.totalAmount ?? bill.amount ?? 0), 0);
    this.totalPayments = bills.filter(paid).reduce((sum, bill) => sum + Number(bill.totalAmount ?? bill.amount ?? 0), 0);
    this.totalRevenue = this.totalPayments;
    this.pendingAmount = bills.filter(bill => !paid(bill)).reduce((sum, bill) => sum + Number(bill.totalAmount ?? bill.amount ?? 0), 0);
    const today = new Date().toISOString().slice(0, 10);
    const month = today.slice(0, 7);
    this.todayRevenue = bills.filter(bill => paid(bill) && bill.invoiceDate === today).reduce((sum, bill) => sum + Number(bill.totalAmount ?? bill.amount ?? 0), 0);
    this.monthlyRevenue = bills.filter(bill => paid(bill) && bill.invoiceDate?.startsWith(month)).reduce((sum, bill) => sum + Number(bill.totalAmount ?? bill.amount ?? 0), 0);
    this.recentTransactions = bills.slice().sort((a, b) => (b.invoiceDate || '').localeCompare(a.invoiceDate || '')).slice(0, 5).map(bill => ({
      invoice: bill.invoiceId, patient: bill.patientName || 'Unknown patient', service: bill.serviceName || 'Service',
      amount: Number(bill.totalAmount ?? bill.amount ?? 0), payment: bill.paymentStatus, date: bill.invoiceDate
    }));
    const grouped = new Map<string, number>();
    bills.forEach(bill => grouped.set(bill.serviceName || 'Other services', (grouped.get(bill.serviceName || 'Other services') ?? 0) + Number(bill.totalAmount ?? bill.amount ?? 0)));
    this.billingBreakdown = [...grouped.entries()].map(([title, amount]) => ({ title, amount, icon: 'bi-receipt' }));
    this.monthlyData = Array.from({ length: 6 }, (_, offset) => {
      const date = new Date(); date.setDate(1); date.setMonth(date.getMonth() - (5 - offset));
      const key = date.toISOString().slice(0, 7);
      return { month: date.toLocaleString('en', { month: 'short' }), amount: bills.filter(bill => paid(bill) && bill.invoiceDate?.startsWith(key)).reduce((sum, bill) => sum + Number(bill.totalAmount ?? bill.amount ?? 0), 0) };
    });
  }


  // ==============================
  // FORMAT CURRENCY
  // ==============================

  formatCurrency(amount: number): string {
    return '৳' + amount.toLocaleString('en-BD');
  }


  // ==============================
  // PAYMENT STATUS
  // ==============================

  getStatusClass(status: string): string {

    if (String(status).toUpperCase() === 'PAID') {
      return 'status-paid';
    }

    if (String(status).toUpperCase() === 'PENDING') {
      return 'status-pending';
    }

    return '';
  }
}

