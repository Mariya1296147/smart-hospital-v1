import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Router,
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { BillingService } from '../../../core/services/billing.service';
import { Billing } from '../../../models/billing';


@Component({
  selector: 'app-billing-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './billing-form.component.html',
  styleUrl: './billing-form.component.css'
})
export class BillingFormComponent implements OnInit {

  isEdit = false;
  billId = 0;

  bill: Billing = {
    id: 0,
    invoiceId: '',
    patientName: '',
    patientId: '',
    doctor: '',
    department: '',
    serviceName: '',
    amount: 0,
    discount: 0,
    tax: 0,
    totalAmount: 0,
    paymentStatus: 'Pending',
    invoiceDate: ''
  };

  constructor(
    private billingService: BillingService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (id) {

      this.isEdit = true;
      this.billId = Number(id);

      const existingBill =
        this.billingService.getBillById(
          this.billId
        );

      if (existingBill) {
        this.bill = {
          ...existingBill
        };
      }

    } else {

      this.bill.invoiceDate =
        new Date().toISOString().split('T')[0];

    }
  }


  calculateTotal(): void {

    const subtotal =
      Number(this.bill.amount) -
      Number(this.bill.discount);

    this.bill.totalAmount =
      subtotal +
      Number(this.bill.tax);

  }


  saveBill(): void {

    this.calculateTotal();

    if (this.isEdit) {

      this.billingService.updateBill(
        this.bill
      );

      alert('Invoice updated successfully!');

    } else {

      this.billingService.addBill(
        this.bill
      );

      alert('Invoice created successfully!');

    }

    this.router.navigate([
      '/admin/billing'
    ]);

  }

}