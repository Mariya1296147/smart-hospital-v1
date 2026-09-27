import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {

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
      alert('Please fill in all required fields.');
      return;
    }

    alert('Your message has been sent successfully!');

    this.contact = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    };
  }

}