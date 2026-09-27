import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Consultation } from '../../../models/consultation';
import { ConsultationService } from '../../../core/services/consultation.service';

@Component({
  selector: 'app-consultation-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './consultation-view.component.html',
  styleUrl: './consultation-view.component.css'
})
export class ConsultationViewComponent implements OnInit {

  consultation: Consultation | undefined;

  constructor(
    private route: ActivatedRoute,
    private consultationService: ConsultationService
  ) {}

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.consultation =
      this.consultationService.getConsultationById(id);
  }
}