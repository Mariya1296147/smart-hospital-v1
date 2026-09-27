import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-settings', standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  saved = false;
  settings = {
    hospitalName: 'Smart Hospital',
    email: 'info@smarthospital.com',
    phone: '+880 1700-000000',
    address: 'Dhaka, Bangladesh',
    timezone: 'Asia/Dhaka',

    emailNotifications: true,
    appointmentNotifications: true,
    stockAlerts: true
  };
  ngOnInit(): void {
    const data = localStorage.getItem('smart-hospital-settings');

    if (data) this.settings = JSON.parse(data);
  }
  save(): void {
    localStorage.setItem('smart-hospital-settings',
      JSON.stringify(this.settings)); this.saved = true;
    setTimeout(() => this.saved = false, 2500);
  }
}
