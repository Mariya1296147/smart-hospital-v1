import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

import { PharmacyService } from '../../../core/services/pharmacy.service';
import { Pharmacy } from '../../../models/Pharmacy';


@Component({
  selector: 'app-pharmacy-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './pharmacy-form.component.html',
  styleUrl: './pharmacy-form.component.css'
})
export class PharmacyFormComponent implements OnInit {

  isEdit = false;
  medicineIdValue = 0;
  readonly stockPath: string;
  error = '';
  saving = false;

  medicine: Pharmacy = {
    id: 0,
    medicineId: '',
    medicineName: '',
    category: '',
    manufacturer: '',
    batchNumber: '',
    quantity: 0,
    unitPrice: 0,
    purchasePrice: 0,
    sellingPrice: 0,
    lowStockThreshold: 10,
    expiryDate: '',
    supplier: '',
    status: 'Available'
  };

  constructor(
    private pharmacyService: PharmacyService,
    private router: Router,
    private route: ActivatedRoute
  ) { this.stockPath = this.router.url.startsWith('/pharmacy/') ? '/pharmacy/stock' : '/admin/pharmacy'; }

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (id) {

      this.isEdit = true;

      this.medicineIdValue = Number(id);

      this.pharmacyService.getMedicineById(this.medicineIdValue).subscribe({
        next: existing => this.medicine = { ...existing, purchasePrice: existing.purchasePrice ?? existing.unitPrice, sellingPrice: existing.sellingPrice ?? existing.unitPrice },
        error: error => this.error = error?.error?.message || 'Medicine details could not be loaded.'
      });
    }
  }

  saveMedicine(): void {
    this.error = '';
    this.medicine.unitPrice = Number(this.medicine.sellingPrice ?? this.medicine.unitPrice);
    this.saving = true;

    if (this.isEdit) {

      this.pharmacyService.updateMedicine(this.medicineIdValue, this.medicine).subscribe({
        next: () => { this.saving = false; this.router.navigate([this.stockPath]); },
        error: error => { this.saving = false; this.error = error?.error?.message || 'Medicine update failed.'; }
      });

    } else {

      this.pharmacyService.addMedicine(this.medicine).subscribe({
        next: () => { this.saving = false; this.router.navigate([this.stockPath]); },
        error: error => { this.saving = false; this.error = error?.error?.message || 'Medicine could not be saved.'; }
      });
    }

  }

}
