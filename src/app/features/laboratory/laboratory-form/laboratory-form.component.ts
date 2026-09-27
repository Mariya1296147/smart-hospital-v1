import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Router,
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { LaboratoryService } from '../../../core/services/laboratory.service';
import { Laboratory } from '../../../models/laboratory';


@Component({
  selector: 'app-laboratory-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './laboratory-form.component.html',
  styleUrl: './laboratory-form.component.css'
})
export class LaboratoryFormComponent implements OnInit {

  isEdit = false;
  laboratoryId = 0;

  laboratory: Laboratory = {
    id: 0,
    testId: '',
    patientName: '',
    testName: '',
    department: '',
    doctor: '',
    sampleDate: '',
    result: '',
    status: 'Pending'
  };

  constructor(
    private laboratoryService: LaboratoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (id) {

      this.isEdit = true;

      this.laboratoryId = Number(id);

      const existingTest =
        this.laboratoryService.getLaboratoryById(
          this.laboratoryId
        );

      if (existingTest) {
        this.laboratory = { ...existingTest };
      }
    }
  }

  saveLaboratory(): void {

    if (this.isEdit) {

      this.laboratoryService.updateLaboratory(
        this.laboratory
      );

      alert('Laboratory test updated successfully!');

    } else {

      this.laboratoryService.addLaboratory(
        this.laboratory
      );

      alert('Laboratory test added successfully!');
    }

    this.router.navigate([
      '/admin/laboratory'
    ]);
  }
}