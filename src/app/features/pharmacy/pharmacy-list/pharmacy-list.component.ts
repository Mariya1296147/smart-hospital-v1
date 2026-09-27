import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PharmacyService } from '../../../core/services/pharmacy.service';
import { Pharmacy } from '../../../models/Pharmacy';


@Component({
  selector: 'app-pharmacy-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './pharmacy-list.component.html',
  styleUrl: './pharmacy-list.component.css'
})
export class PharmacyListComponent implements OnInit {

  medicines: Pharmacy[] = [];

  ngOnInit(): void {
    this.loadMedicines();
  }

  constructor(
    private pharmacyService: PharmacyService
  ) {}

  loadMedicines(): void {
    this.medicines =
      this.pharmacyService.getMedicines();
  }

  deleteMedicine(id: number): void {

    if (
      confirm(
        'Are you sure you want to delete this medicine?'
      )
    ) {

      this.pharmacyService.deleteMedicine(id);

      this.loadMedicines();

      alert('Medicine deleted successfully!');
    }
  }

  get totalMedicines(): number {
    return this.medicines.length;
  }

  get availableMedicines(): number {
    return this.medicines.filter(
      medicine => medicine.status === 'Available'
    ).length;
  }

  get lowStockMedicines(): number {
    return this.medicines.filter(
      medicine => medicine.status === 'Low Stock'
    ).length;
  }

  get outOfStockMedicines(): number {
    return this.medicines.filter(
      medicine => medicine.status === 'Out of Stock'
    ).length;
  }

  get expiredMedicines(): number {
    return this.medicines.filter(
      medicine => medicine.status === 'Expired'
    ).length;
  }
}