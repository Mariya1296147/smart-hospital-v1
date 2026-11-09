import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

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
  readonly staffWorkspace: boolean;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.loadMedicines();
  }

  constructor(
    private pharmacyService: PharmacyService,
    private router: Router
  ) { this.staffWorkspace = this.router.url.startsWith('/pharmacy/'); }

  get stockPath(): string { return this.staffWorkspace ? '/pharmacy/stock' : '/admin/pharmacy'; }

  loadMedicines(): void {
    this.loading = true;
    this.error = '';
    this.pharmacyService.getMedicines().subscribe({
      next: medicines => { this.medicines = medicines; this.loading = false; },
      error: error => { this.error = error?.error?.message || 'Medicine stock could not be loaded.'; this.loading = false; }
    });
  }

  deleteMedicine(id: number): void {

    if (
      confirm(
        'Are you sure you want to delete this medicine?'
      )
    ) {

      this.pharmacyService.deleteMedicine(id).subscribe({
        next: () => this.loadMedicines(),
        error: error => { this.error = error?.error?.message || 'Medicine could not be deleted.'; }
      });
    }
  }

  get totalMedicines(): number {
    return this.medicines.length;
  }

  get availableMedicines(): number {
    return this.medicines.filter(
      medicine => medicine.status === 'AVAILABLE' || medicine.status === 'Available'
    ).length;
  }

  get lowStockMedicines(): number {
    return this.medicines.filter(
      medicine => medicine.status === 'LOW STOCK' || medicine.status === 'Low Stock'
    ).length;
  }

  get outOfStockMedicines(): number {
    return this.medicines.filter(
      medicine => medicine.status === 'OUT OF STOCK' || medicine.status === 'Out of Stock'
    ).length;
  }

  get expiredMedicines(): number {
    return this.medicines.filter(
      medicine => medicine.status === 'EXPIRED' || medicine.status === 'Expired'
    ).length;
  }
}
