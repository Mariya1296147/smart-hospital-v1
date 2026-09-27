import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {

  features = [
    {
      icon: 'bi bi-heart-pulse-fill',
      title: 'Quality Healthcare',
      text: 'We provide reliable and quality healthcare services for every patient.'
    },
    {
      icon: 'bi bi-person-check-fill',
      title: 'Expert Doctors',
      text: 'Our experienced medical professionals are committed to patient care.'
    },
    {
      icon: 'bi bi-clock-fill',
      title: '24/7 Support',
      text: 'Our healthcare team is available around the clock when you need us.'
    },
    {
      icon: 'bi bi-shield-check',
      title: 'Patient Safety',
      text: 'We maintain a safe, clean and patient-friendly healthcare environment.'
    }
  ];

}