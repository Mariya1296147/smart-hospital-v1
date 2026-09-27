import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';

import { BillingService } from '../../../core/services/billing.service';
import { Billing } from '../../../models/billing';


@Component({
  selector: 'app-billing-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './billing-view.component.html',
  styleUrl: './billing-view.component.css'
})
export class BillingViewComponent implements OnInit {

  bill: Billing | undefined;

  constructor(
    private billingService: BillingService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.bill =
      this.billingService.getBillById(id);

    if (!this.bill) {
      alert('Invoice not found!');
      this.router.navigate(['/admin/billing']);
    }
  }
}