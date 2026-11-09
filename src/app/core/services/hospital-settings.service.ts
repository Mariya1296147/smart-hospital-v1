import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface HospitalSettings {
  hospitalName: string;
  email: string;
  phone: string;
  emergencyPhone: string;
  address: string;
  timezone: string;
  emailNotifications: boolean;
  appointmentNotifications: boolean;
  stockAlerts: boolean;
}

@Injectable({ providedIn: 'root' })
export class HospitalSettingsService {
  private readonly storageKey = 'smart-hospital-settings';
  private readonly defaults: HospitalSettings = {
    hospitalName: 'Smart Hospital',
    email: '',
    phone: '',
    emergencyPhone: '',
    address: 'Dhaka, Bangladesh',
    timezone: 'Asia/Dhaka',
    emailNotifications: true,
    appointmentNotifications: true,
    stockAlerts: true
  };

  constructor(private readonly sanitizer: DomSanitizer) {}

  getSettings(): HospitalSettings {
    try {
      const saved = localStorage.getItem(this.storageKey);
      const settings = saved ? { ...this.defaults, ...JSON.parse(saved) } : { ...this.defaults };
      if (settings.email?.trim().toLowerCase() === 'info@smarthospital.com') settings.email = '';
      if (this.isPlaceholderPhone(settings.phone)) settings.phone = '';
      if (this.isPlaceholderPhone(settings.emergencyPhone) || settings.emergencyPhone?.trim() === '999') {
        settings.emergencyPhone = '';
      }
      return settings;
    } catch {
      return { ...this.defaults };
    }
  }

  private isPlaceholderPhone(phone?: string): boolean {
    const digits = (phone ?? '').replace(/\D/g, '');
    return ['8801700000000', '8801712345678', '8801000000000'].includes(digits);
  }

  saveSettings(settings: HospitalSettings): void {
    localStorage.setItem(this.storageKey, JSON.stringify(settings));
  }

  getMapEmbedUrl(address: string): SafeResourceUrl | null {
    const query = address.trim();
    if (!query) return null;
    const url = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
