import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactService } from '../../../core/services/contact.service';
import { HospitalSettings, HospitalSettingsService } from '../../../core/services/hospital-settings.service';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  hospitalSettings: HospitalSettings;
  mapEmbedUrl: SafeResourceUrl | null;

  constructor(
    private readonly contactService: ContactService,
    hospitalSettingsService: HospitalSettingsService
  ) {
    this.hospitalSettings = hospitalSettingsService.getSettings();
    this.mapEmbedUrl = hospitalSettingsService.getMapEmbedUrl(this.hospitalSettings.address);
  }

  contact = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  submitForm(): void {

    if (
      !this.contact.name ||
      !this.contact.email ||
      !this.contact.subject ||
      !this.contact.message
    ) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.contactService.submit(this.contact).subscribe({
      next: response => {
        this.successMessage = `Your message was received. Reference number: ${response.ticketId}.`;
        this.contact = { name: '', email: '', phone: '', subject: '', message: '' };
      },
      error: error => {
        console.error('Contact message submission failed:', error);
        this.errorMessage = error.error?.message || 'Your message could not be submitted. Please try again later.';
        this.isSubmitting = false;
      },
      complete: () => this.isSubmitting = false
    });
  }

}
