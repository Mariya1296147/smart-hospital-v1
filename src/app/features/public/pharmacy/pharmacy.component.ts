import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pharmacy',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './pharmacy.component.html',
  styleUrl: './pharmacy.component.css'
})
export class PharmacyComponent {

  pharmacyServices = [
    {
      icon: 'bi bi-capsule',
      title: 'Prescription Medicines',
      description: 'Quality medicines available according to valid prescriptions.'
    },
    {
      icon: 'bi bi-person-check-fill',
      title: 'Pharmacist Support',
      description: 'Professional guidance from trained pharmacy staff.'
    },
    {
      icon: 'bi bi-shield-check-fill',
      title: 'Quality Medicines',
      description: 'Medicines handled and stored according to proper standards.'
    },
    {
      icon: 'bi bi-clock-fill',
      title: '24/7 Pharmacy',
      description: 'Pharmacy support available for patients whenever needed.'
    },
    {
      icon: 'bi bi-prescription2',
      title: 'Prescription Review',
      description: 'Careful review of prescriptions before medicine dispensing.'
    },
    {
      icon: 'bi bi-box-seam-fill',
      title: 'Medicine Availability',
      description: 'A wide range of commonly required medicines and healthcare products.'
    }
  ];

  categories = [
    'Prescription Medicines',
    'Pain Relief Medicines',
    'Antibiotics',
    'Vitamins & Supplements',
    'Diabetes Care',
    'Blood Pressure Care',
    'First Aid Products',
    'Medical Supplies'
  ];

}