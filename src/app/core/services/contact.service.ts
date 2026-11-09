import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  receivedAt: string;
}

export interface ContactSubmissionResponse {
  ticketId: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  constructor(private readonly api: ApiService) {}

  submit(message: Omit<ContactMessage, 'id' | 'status' | 'receivedAt'>): Observable<ContactSubmissionResponse> {
    return this.api.create<ContactSubmissionResponse, typeof message>('public/contact', message);
  }

  getMessages(): Observable<ContactMessage[]> {
    return this.api.getResource<ContactMessage[]>('admin/contact-messages');
  }
}
