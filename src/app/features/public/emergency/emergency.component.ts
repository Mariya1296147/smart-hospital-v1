import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HospitalSettings, HospitalSettingsService } from '../../../core/services/hospital-settings.service';

@Component({
  selector: 'app-emergency',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './emergency.component.html',
  styleUrl: './emergency.component.css'
})
export class EmergencyComponent {
  readonly hospitalSettings: HospitalSettings;

  constructor(hospitalSettingsService: HospitalSettingsService) {
    this.hospitalSettings = hospitalSettingsService.getSettings();
  }

  emergencyServices = [
    {
      icon: 'bi bi-truck-front-fill',
      title: '24/7 Emergency Service',
      description: 'Our emergency team is available 24 hours a day, 7 days a week.'
    },
    {
      icon: 'bi bi-heart-pulse',
      title: 'Critical Care',
      description: 'Fast and professional care for critical and urgent medical conditions.'
    },
    {
      icon: 'bi bi-person-plus',
      title: 'Emergency Doctors',
      description: 'Experienced doctors and trained medical staff are ready to assist you.'
    },
    {
      icon: 'bi bi-hospital',
      title: 'Emergency Department',
      description: 'Modern emergency facilities with quick patient assessment and treatment.'
    }
  ];

}
