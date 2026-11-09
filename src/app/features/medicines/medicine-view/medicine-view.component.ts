
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { MedicineService } from '../../../core/services/medicine.service';
import { Medicine } from '../../../models/medicin';
 

@Component({
  selector: 'app-medicine-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './medicine-view.component.html',
  styleUrl: './medicine-view.component.css'
})
export class MedicineViewComponent implements OnInit {

  medicine: Medicine | null = null;
  isLoading = false;

  constructor(
    private medicineService: MedicineService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.loadMedicine(id);
    }
  }

  loadMedicine(id: number): void {
    this.isLoading = true;

    this.medicineService.getMedicineById(id).subscribe({
      next: (data) => {
        this.medicine = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.isLoading = false;
      }
    });
  }
}
