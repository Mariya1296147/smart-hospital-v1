import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Consultation } from '../../../models/consultation';
import { ConsultationService } from '../../../core/services/consultation.service';

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
    private consultationService: ConsultationService
  ) {}

  ngOnInit(): void {
    this.loadConsultations();
  }

  loadConsultations(): void {
    this.consultations =
      this.consultationService.getConsultations();
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
      this.consultationService.deleteConsultation(id);
      this.loadConsultations();
    }
  }
}