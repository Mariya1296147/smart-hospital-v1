import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AdmissionService } from '../../../core/services/admission.service';
import { Admission } from '../../../models/admission';


@Component({
  selector: 'app-admission-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admission-list.component.html',
  styleUrl: './admission-list.component.css'
})
export class AdmissionListComponent implements OnInit {

  admissions: Admission[] = [];

  constructor(
    private admissionService: AdmissionService
  ) {}

  ngOnInit(): void {
    this.loadAdmissions();
  }

  loadAdmissions(): void {
    this.admissions = this.admissionService.getAdmissions();
  }

  deleteAdmission(id: number): void {

    if (confirm('Are you sure you want to delete this admission?')) {

      this.admissionService.deleteAdmission(id);

      this.loadAdmissions();

      alert('Admission deleted successfully!');
    }
  }
}