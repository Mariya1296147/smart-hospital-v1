import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HospitalSettings, HospitalSettingsService } from '../../../core/services/hospital-settings.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  readonly hospitalSettings: HospitalSettings;

  constructor(hospitalSettingsService: HospitalSettingsService) {
    this.hospitalSettings = hospitalSettingsService.getSettings();
  }
}
