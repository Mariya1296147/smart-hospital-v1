import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { BillingService } from '../../../core/services/billing.service';
import { Billing } from '../../../models/billing';


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

  constructor(
    private billingService: BillingService
  ) {}

  ngOnInit(): void {
    this.loadBills();
  }

  loadBills(): void {
    this.bills =
      this.billingService.getBills();
  }

  deleteBill(id: number): void {

    if (
      confirm(
        'Are you sure you want to delete this invoice?'
      )
    ) {

      this.billingService.deleteBill(id);

      this.loadBills();

      alert('Invoice deleted successfully!');
    }
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

}