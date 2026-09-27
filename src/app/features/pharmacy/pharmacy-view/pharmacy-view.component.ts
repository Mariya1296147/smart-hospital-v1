import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

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

  constructor(
    private pharmacyService: PharmacyService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    const id =
      Number(
        this.route.snapshot.paramMap.get('id')
      );

    const data =
      this.pharmacyService.getMedicineById(id);

    if (data) {
      this.medicine = data;
    }
  }

}