import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.css'
})
export class DepartmentsComponent {

  departments = [
    {
      icon: 'bi bi-heart-pulse-fill',
      name: 'Cardiology',
      doctors: 8,
      description: 'Specialized care for heart and cardiovascular conditions.'
    },
    {
      icon: 'bi bi-activity',
      name: 'Neurology',
      doctors: 6,
      description: 'Diagnosis and treatment of brain and nervous system disorders.'
    },
    {
      icon: 'bi bi-person-hearts',
      name: 'Pediatrics',
      doctors: 7,
      description: 'Complete healthcare services for infants, children and teenagers.'
    },
    {
      icon: 'bi bi-bandaid-fill',
      name: 'Orthopedics',
      doctors: 5,
      description: 'Treatment for bones, joints, muscles and movement conditions.'
    },
    {
      icon: 'bi bi-person-fill',
      name: 'Dermatology',
      doctors: 4,
      description: 'Professional diagnosis and treatment for skin conditions.'
    },
    {
      icon: 'bi bi-gender-female',
      name: 'Gynecology',
      doctors: 6,
      description: 'Specialized healthcare for women at every stage of life.'
    },
    {
      icon: 'bi bi-ear-fill',
      name: 'ENT',
      doctors: 4,
      description: 'Medical care for ear, nose and throat conditions.'
    },
    {
      icon: 'bi bi-eye-fill',
      name: 'Ophthalmology',
      doctors: 5,
      description: 'Comprehensive diagnosis and treatment for eye conditions.'
    },
    {
      icon: 'bi bi-lungs-fill',
      name: 'Pulmonology',
      doctors: 4,
      description: 'Specialized treatment for respiratory and lung diseases.'
    },
    {
      icon: 'bi bi-capsule-pill',
      name: 'General Medicine',
      doctors: 10,
      description: 'Primary medical care for common and complex health conditions.'
    },
    {
      icon: 'bi bi-person-check-fill',
      name: 'Urology',
      doctors: 4,
      description: 'Diagnosis and treatment of urinary and reproductive conditions.'
    },
    {
      icon: 'bi bi-scissors',
      name: 'General Surgery',
      doctors: 6,
      description: 'Professional surgical care supported by experienced specialists.'
    }
  ];

}