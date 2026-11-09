import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HospitalSettings, HospitalSettingsService } from '../../core/services/hospital-settings.service';


@Component({
  selector: 'app-settings', standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  saved = false;
  settings: HospitalSettings;

  constructor(private readonly hospitalSettings: HospitalSettingsService) {
    this.settings = hospitalSettings.getSettings();
  }

  ngOnInit(): void {
    this.settings = this.hospitalSettings.getSettings();
  }
  save(): void {
    this.hospitalSettings.saveSettings(this.settings);
    this.saved = true;
    setTimeout(() => this.saved = false, 2500);
  }
}
