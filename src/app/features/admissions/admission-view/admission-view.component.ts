import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

import { AdmissionService } from '../../../core/services/admission.service';
import { Admission } from '../../../models/admission';


@Component({
  selector: 'app-admission-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admission-view.component.html',
  styleUrl: './admission-view.component.css'
})
export class AdmissionViewComponent implements OnInit {

  admission!: Admission;

  constructor(
    private admissionService: AdmissionService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    const data = this.admissionService.getAdmissionById(id);

    if (data) {
      this.admission = data;
    }

  }

}