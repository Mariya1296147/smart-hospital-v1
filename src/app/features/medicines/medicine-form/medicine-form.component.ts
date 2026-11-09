
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MedicineService } from '../../../core/services/medicine.service';
import { Medicine } from '../../../models/medicin';


@Component({
  selector: 'app-medicine-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medicine-form.component.html',
  styleUrl: './medicine-form.component.css'
})
export class MedicineFormComponent implements OnInit {

  medicine: Medicine = this.createEmptyMedicine();

  isEditMode = false;
  isSaving = false;

  constructor(
    private medicineService: MedicineService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.loadMedicine(Number(id));
    }
  }

  createEmptyMedicine(): Medicine {
    return {
      id: 0,
      medicineName: '',
      genericName: '',
      category: '',
      strength: '',
      manufacturer: '',
      active: true
    };
  }

  loadMedicine(id: number): void {
    this.medicineService.getMedicineById(id).subscribe({
      next: (data) => {
        this.medicine = data;
      },
      error: (error) => {
        console.error(error);
        alert('Medicine not found.');
        this.cancel();
      }
    });
  }

  saveMedicine(): void {
    if (
      !this.medicine.medicineName.trim() ||
      !this.medicine.genericName.trim() ||
      !this.medicine.category.trim() ||
      !this.medicine.strength.trim()
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    this.isSaving = true;

    const request = this.isEditMode
      ? this.medicineService['updateMedicine'](this.medicine.id, this.medicine)
      : this.medicineService['addMedicine'](this.medicine);

    request.subscribe({
      next: () => {
        alert(this.isEditMode
          ? 'Medicine updated successfully.'
          : 'Medicine added successfully.');

        this.router.navigate(['/admin/medicines']);
      },
      error: (error: any) => {
        console.error('Medicine save failed', error);
        alert('Failed to save medicine.');
        this.isSaving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/medicines']);
  }
}
