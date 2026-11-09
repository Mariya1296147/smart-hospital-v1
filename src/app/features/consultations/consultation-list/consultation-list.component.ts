import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Consultation } from '../../../models/consultation';
import { ConsultationService } from '../../../core/services/consultation.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-consultation-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './consultation-list.component.html',
  styleUrl: './consultation-list.component.css'
})
export class ConsultationListComponent implements OnInit {

  consultations: Consultation[] = [];

  constructor(
    private consultationService: ConsultationService,
    public authService: AuthService
  ) {}

  get consultationsRoute(): string {
    if (this.authService.hasRole('DOCTOR')) return '/doctor/consultations';
    return '/admin/consultations';
  }

  ngOnInit(): void {
    this.loadConsultations();
  }

  loadConsultations(): void {
    this.consultationService.getConsultations().subscribe({
      next: consultations => this.consultations = consultations,
      error: error => console.error('পরামর্শের তালিকা লোড করা যায়নি', error)
    });
  }

  get totalConsultations(): number {
    return this.consultations.length;
  }

  get completedConsultations(): number {
    return this.consultations.filter(
      consultation => consultation.status === 'Completed'
    ).length;
  }

  get pendingConsultations(): number {
    return this.consultations.filter(
      consultation => consultation.status === 'Pending'
    ).length;
  }

  deleteConsultation(id: number): void {

    const confirmed = confirm(
      'Are you sure you want to delete this consultation?'
    );

    if (confirmed) {
      this.consultationService.deleteConsultation(id).subscribe({
        next: () => this.loadConsultations(),
        error: error => console.error('পরামর্শ মুছতে ব্যর্থ', error)
      });
    }
  }
}
