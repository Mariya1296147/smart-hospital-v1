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

  medicine: Pharmacy = {
    id: 0,
    medicineId: '',
    medicineName: '',
    category: '',
    manufacturer: '',
    quantity: 0,
    unitPrice: 0,
    expiryDate: '',
    supplier: '',
    status: 'Available'
  };

  constructor(
    private pharmacyService: PharmacyService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (id) {

      this.isEdit = true;

      this.medicineIdValue = Number(id);

      const existingMedicine =
        this.pharmacyService.getMedicineById(
          this.medicineIdValue
        );

      if (existingMedicine) {
        this.medicine = {
          ...existingMedicine
        };
      }
    }
  }

  saveMedicine(): void {

    if (this.isEdit) {

      this.pharmacyService.updateMedicine(
        this.medicine
      );

      alert('Medicine updated successfully!');

    } else {

      this.pharmacyService.addMedicine(
        this.medicine
      );

      alert('Medicine added successfully!');
    }

    this.router.navigate([
      '/admin/pharmacy'
    ]);
  }

}