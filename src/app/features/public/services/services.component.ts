import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {

  services = [
    {
      icon: 'bi bi-heart-pulse-fill',
      title: 'Emergency Care',
      description:
        '24/7 emergency medical care for urgent and critical conditions.'
    },

    {
      icon: 'bi bi-person-badge-fill',
      title: 'Expert Doctors',
      description:
        'Experienced doctors providing professional and personalized healthcare.'
    },

    {
      icon: 'bi bi-droplet-half',
      title: 'Laboratory',
      description:
        'Modern laboratory facilities for accurate and reliable medical tests.'
    },

    {
      icon: 'bi bi-capsule-pill',
      title: 'Pharmacy',
      description:
        'Convenient access to prescribed medicines and pharmacy services.'
    },

    {
      icon: 'bi bi-truck-front-fill',
      title: 'Ambulance Service',
      description:
        'Fast and reliable ambulance support for emergency transportation.'
    },

    {
      icon: 'bi bi-hospital-fill',
      title: 'ICU & Critical Care',
      description:
        'Advanced intensive care services for patients requiring close monitoring.'
    },

    {
      icon: 'bi bi-heart-fill',
      title: 'Cardiology',
      description:
        'Specialized diagnosis and treatment for heart-related conditions.'
    },

    {
      icon: 'bi bi-person-hearts',
      title: 'Patient Care',
      description:
        'Safe, respectful and patient-focused healthcare services.'
    }
  ];
}