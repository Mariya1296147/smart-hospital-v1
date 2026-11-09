import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactMessage, ContactService } from '../core/services/contact.service';

@Component({
  selector: 'app-contact-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-messages.component.html'
})
export class ContactMessagesComponent implements OnInit {
  messages: ContactMessage[] = [];
  loading = false;
  error = '';

  constructor(private readonly contacts: ContactService) { }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.contacts.getMessages().subscribe({
      next: messages => { this.messages = messages ?? []; this.loading = false; },
      error: error => {
        console.error('Contact inbox failed to load:', error);
        this.error = 'Contact messages could not be loaded.';
        this.loading = false;
      }
    });
  }
}
