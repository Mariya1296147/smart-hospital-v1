
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  totalRevenue = 1250000;
  totalBilling = 1485000;
  totalPayments = 1125000;
  pendingAmount = 360000;

  totalRefunds = 45000;
  totalPatients = 1248;
  todayRevenue = 68500;
  monthlyRevenue = 425000;


  // ==============================
  // BILLING BREAKDOWN
  // ==============================

  billingBreakdown = [
    {
      title: 'Consultation Fees',
      amount: 185000,
      icon: 'bi-person-badge'
    },
    {
      title: 'Laboratory Charges',
      amount: 275000,
      icon: 'bi-eyedropper'
    },
    {
      title: 'Pharmacy Sales',
      amount: 325000,
      icon: 'bi-capsule'
    },
    {
      title: 'Admission & Bed',
      amount: 295000,
      icon: 'bi-hospital'
    },
    {
      title: 'Emergency Services',
      amount: 165000,
      icon: 'bi-heart-pulse'
    },
    {
      title: 'Other Services',
      amount: 240000,
      icon: 'bi-receipt'
    }
  ];


  // ==============================
  // RECENT TRANSACTIONS
  // ==============================

  recentTransactions = [
    {
      invoice: 'INV-1001',
      patient: 'Mariya Rahman',
      service: 'Consultation',
      amount: 2500,
      payment: 'Paid',
      date: '24 Sep 2026'
    },
    {
      invoice: 'INV-1002',
      patient: 'Sarah Ahmed',
      service: 'Laboratory',
      amount: 5800,
      payment: 'Paid',
      date: '24 Sep 2026'
    },
    {
      invoice: 'INV-1003',
      patient: 'Rahim Khan',
      service: 'Pharmacy',
      amount: 3250,
      payment: 'Pending',
      date: '23 Sep 2026'
    },
    {
      invoice: 'INV-1004',
      patient: 'Nusrat Jahan',
      service: 'Admission',
      amount: 18500,
      payment: 'Paid',
      date: '23 Sep 2026'
    },
    {
      invoice: 'INV-1005',
      patient: 'Tanvir Hasan',
      service: 'Emergency',
      amount: 7200,
      payment: 'Pending',
      date: '22 Sep 2026'
    }
  ];


  // ==============================
  // MONTHLY REVENUE
  // ==============================

  monthlyData = [
    { month: 'Apr', amount: 285000 },
    { month: 'May', amount: 325000 },
    { month: 'Jun', amount: 365000 },
    { month: 'Jul', amount: 390000 },
    { month: 'Aug', amount: 410000 },
    { month: 'Sep', amount: 425000 }
  ];


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

    if (status === 'Paid') {
      return 'status-paid';
    }

    if (status === 'Pending') {
      return 'status-pending';
    }

    return '';
  }
}

