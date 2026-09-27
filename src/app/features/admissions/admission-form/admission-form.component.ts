import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

import { AdmissionService } from '../../../core/services/admission.service';
import { Admission } from '../../../models/admission';


@Component({
  selector: 'app-admission-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admission-form.component.html',
  styleUrl: './admission-form.component.css'
})
export class AdmissionFormComponent implements OnInit {

  isEdit = false;
  admissionId = 0;

  admission: Admission = {
    id: 0,
    admissionId: '',
    patientName: '',
    department: '',
    doctor: '',
    admissionDate: '',
    ward: '',
    bed: '',
    reason: '',
    status: 'Admitted'
  };

  constructor(
    private admissionService: AdmissionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {

      this.isEdit = true;
      this.admissionId = Number(id);

      const existingAdmission =
        this.admissionService.getAdmissionById(this.admissionId);

      if (existingAdmission) {
        this.admission = { ...existingAdmission };
      }

    }

  }

  saveAdmission(): void {

    if (this.isEdit) {

      this.admissionService.updateAdmission(this.admission);

      alert('Admission updated successfully!');

    } else {

      this.admissionService.addAdmission(this.admission);

      alert('Admission added successfully!');

    }

    this.router.navigate(['/admin/admissions']);
  }

}