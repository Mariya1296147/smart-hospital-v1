import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';

@Component({
  selector: 'app-patient-view',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './patient-view.component.html',
  styleUrl: './patient-view.component.css'
})
export class PatientViewComponent {

  patient: any;

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService
  ) {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.patient =
      this.patientService.getPatientById(id);
  }

}