import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-laboratory',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './laboratory.component.html',
  styleUrl: './laboratory.component.css'
})
export class LaboratoryComponent {

  laboratoryServices = [
    {
      icon: 'bi bi-droplet-half',
      title: 'Blood Tests',
      description: 'Complete blood testing and routine blood investigations.'
    },
    {
      icon: 'bi bi-heart-pulse-fill',
      title: 'Health Checkup',
      description: 'Comprehensive health screening for early detection.'
    },
    {
      icon: 'bi bi-eyedropper',
      title: 'Diagnostic Tests',
      description: 'Accurate diagnostic testing with modern equipment.'
    },
    {
      icon: 'bi bi-clipboard2-pulse',
      title: 'Pathology',
      description: 'Professional pathology services with reliable reports.'
    },
    {
      icon: 'bi bi-radioactive',
      title: 'Imaging & Scan',
      description: 'Modern imaging and diagnostic scanning services.'
    },
    {
      icon: 'bi bi-file-medical',
      title: 'Digital Reports',
      description: 'Fast and organized laboratory reports for patients.'
    }
  ];

  tests = [
    'Complete Blood Count (CBC)',
    'Blood Glucose Test',
    'Lipid Profile',
    'Liver Function Test',
    'Kidney Function Test',
    'Thyroid Function Test',
    'Urine Test',
    'HbA1c Test'
  ];

}