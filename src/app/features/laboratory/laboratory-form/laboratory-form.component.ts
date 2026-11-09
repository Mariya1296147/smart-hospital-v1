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
import { PatientService } from '../../../core/services/patient.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { DepartmentService } from '../../../core/services/department.service';
import { Patient } from '../../../models/patient';


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
    patientId: '',
    testName: '',
    department: '',
    doctor: '',
    sampleDate: '',
    result: '',
    status: 'Pending'
  };
  patients: Patient[] = [];
  doctors: string[] = [];
  departments: string[] = [];

  constructor(
    private laboratoryService: LaboratoryService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private departmentService: DepartmentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.patientService.getPatients().subscribe({ next: items => this.patients = items ?? [], error: error => console.error('Patients failed to load', error) });
    this.doctorService.getDoctors().subscribe({ next: items => this.doctors = (items ?? []).map(item => item.name), error: error => console.error('Doctors failed to load', error) });
    this.departmentService.getAll().subscribe({ next: items => this.departments = (items ?? []).map(item => item.departmentName), error: error => console.error('Departments failed to load', error) });

    const id =
      this.route.snapshot.paramMap.get('id');

    if (id) {

      this.isEdit = true;

      this.laboratoryId = Number(id);

      this.laboratoryService.getLaboratoryById(this.laboratoryId).subscribe({
        next: existing => this.laboratory = { ...existing },
        error: error => console.error('ল্যাব পরীক্ষার তথ্য লোড করা যায়নি', error)
      });
    }
  }

  onPatientChange(): void {
    const patient = this.patients.find(item => item.patientId === this.laboratory.patientId);
    if (patient) this.laboratory.patientName = patient.name;
  }

  saveLaboratory(): void {

    if (this.isEdit) {

      this.laboratoryService.updateLaboratory(this.laboratoryId, this.laboratory).subscribe({
        next: () => { alert('ল্যাব পরীক্ষার তথ্য হালনাগাদ হয়েছে।'); this.router.navigate(['/admin/laboratory']); },
        error: error => console.error('ল্যাব পরীক্ষার তথ্য হালনাগাদ ব্যর্থ', error)
      });

    } else {

      this.laboratoryService.addLaboratory(this.laboratory).subscribe({
        next: () => { alert('ল্যাব পরীক্ষার তথ্য সংরক্ষিত হয়েছে।'); this.router.navigate(['/admin/laboratory']); },
        error: error => console.error('ল্যাব পরীক্ষার তথ্য সংরক্ষণ ব্যর্থ', error)
      });
    }

  }
}
