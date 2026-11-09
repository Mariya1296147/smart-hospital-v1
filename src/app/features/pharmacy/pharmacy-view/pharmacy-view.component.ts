import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

import { PharmacyService } from '../../../core/services/pharmacy.service';
import { Pharmacy } from '../../../models/Pharmacy';


@Component({
  selector: 'app-pharmacy-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './pharmacy-view.component.html',
  styleUrl: './pharmacy-view.component.css'
})
export class PharmacyViewComponent implements OnInit {

  medicine!: Pharmacy;
  readonly stockPath: string;

  constructor(
    private pharmacyService: PharmacyService,
    private route: ActivatedRoute,
    private router: Router
  ) { this.stockPath = this.router.url.startsWith('/pharmacy/') ? '/pharmacy/stock' : '/admin/pharmacy'; }

  ngOnInit(): void {

    const id =
      Number(
        this.route.snapshot.paramMap.get('id')
      );

    this.pharmacyService.getMedicineById(id).subscribe({
      next: data => this.medicine = data,
      error: error => console.error('ওষুধের তথ্য পাওয়া যায়নি', error)
    });
  }

}
