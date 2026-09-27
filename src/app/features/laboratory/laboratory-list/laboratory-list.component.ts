import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { LaboratoryService } from '../../../core/services/laboratory.service';
import { Laboratory } from '../../../models/laboratory';


@Component({
  selector: 'app-laboratory-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './laboratory-list.component.html',
  styleUrl: './laboratory-list.component.css'
})
export class LaboratoryListComponent implements OnInit {

  laboratoryTests: Laboratory[] = [];

  constructor(
    private laboratoryService: LaboratoryService
  ) {}

  ngOnInit(): void {
    this.loadLaboratoryTests();
  }

  loadLaboratoryTests(): void {
    this.laboratoryTests =
      this.laboratoryService.getLaboratoryTests();
  }

  deleteLaboratory(id: number): void {

    if (confirm('Are you sure you want to delete this laboratory test?')) {

      this.laboratoryService.deleteLaboratory(id);

      this.loadLaboratoryTests();

      alert('Laboratory test deleted successfully!');
    }
  }
}