import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MedicineService } from '../../../core/services/medicine.service';
import { Medicine } from '../../../models/medicin';


@Component({
  selector: 'app-medicine-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './medicine-list.component.html',
  styleUrl: './medicine-list.component.css'
})
export class MedicineListComponent implements OnInit {

  medicines: Medicine[] = [];
  isLoading = false;
  errorMessage = '';
  searchText = '';

  constructor(private medicineService: MedicineService) {}

  ngOnInit(): void {
    this.loadMedicines();
  }

  loadMedicines(): void {
    this.isLoading = true;

    this.medicineService.getAllMedicines().subscribe({
      next: (data) => {
        this.medicines = data ?? [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Medicine loading failed', error);
        this.errorMessage = 'Failed to load medicines.';
        this.isLoading = false;
      }
    });
  }

  get filteredMedicines(): Medicine[] {
    const keyword = this.searchText.toLowerCase().trim();

    if (!keyword) return this.medicines;

    return this.medicines.filter(m =>
      m.medicineName?.toLowerCase().includes(keyword) ||
      m.genericName?.toLowerCase().includes(keyword) ||
      m.category?.toLowerCase().includes(keyword)
    );
  }

  deleteMedicine(id: number): void {
    if (!confirm('Are you sure you want to delete this medicine?')) {
      return;
    }

    this.medicineService.deleteMedicine(id).subscribe({
      next: () => {
        alert('Medicine deleted successfully.');
        this.loadMedicines();
      },
      error: (error) => {
        console.error(error);
        alert('Failed to delete medicine.');
      }
    });
  }
}