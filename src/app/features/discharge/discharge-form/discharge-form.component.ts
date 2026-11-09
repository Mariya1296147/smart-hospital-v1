import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { DischargeService } from '../../../core/services/discharge.service';
import { Discharge } from '../../../models/discharge';
import { PatientService } from '../../../core/services/patient.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { DepartmentService } from '../../../core/services/department.service';
import { AdmissionService } from '../../../core/services/admission.service';
import { Patient } from '../../../models/patient';
import { Admission } from '../../../models/admission';

@Component({
  selector: 'app-discharge-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './discharge-form.component.html',
  styleUrl: './discharge-form.component.css'
})
export class DischargeFormComponent implements OnInit {

  isEditMode = false;
  dischargeId: number | null = null;

  discharge: Discharge = {
    id: 0,
    dischargeId: '',
    patientName: '',
    patientId: '',
    doctorName: '',
    department: '',
    admissionDate: '',
    dischargeDate: '',
    room: '',
    bed: '',
    dischargeType: 'Normal',
    diagnosis: '',
    treatment: '',
    prescription: '',
    instructions: '',
    status: 'Discharged'
  };

  patients: Patient[] = [];
  doctors: string[] = [];
  departments: string[] = [];
  activeAdmissions: Admission[] = [];

  dischargeTypes = [
    'Normal',
    'Against Medical Advice',
    'Transfer',
    'Death'
  ];

  constructor(
    private dischargeService: DischargeService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private departmentService: DepartmentService,
    private admissionService: AdmissionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.patientService.getPatients().subscribe({ next: items => this.patients = items ?? [], error: error => console.error('Patients failed to load', error) });
    this.doctorService.getDoctors().subscribe({ next: items => this.doctors = (items ?? []).map(item => item.name), error: error => console.error('Doctors failed to load', error) });
    this.departmentService.getAll().subscribe({ next: items => this.departments = (items ?? []).map(item => item.departmentName), error: error => console.error('Departments failed to load', error) });
    this.admissionService.getAdmissions().subscribe({
      next: items => this.activeAdmissions = (items ?? []).filter(item => ['ADMITTED', 'ACTIVE', 'IN_PROGRESS'].includes(String(item.status).toUpperCase())),
      error: error => console.error('Admissions failed to load', error)
    });

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.dischargeId = Number(id);

      this.dischargeService.getDischargeById(this.dischargeId).subscribe({
        next: existing => this.discharge = { ...existing },
        error: error => console.error('ছাড়পত্রের তথ্য লোড করা যায়নি', error)
      });
    } else {
      this.generateDischargeId();
    }
  }

  generateDischargeId(): void {
    this.discharge.dischargeId = `DIS-${Date.now()}`;
  }

  onPatientChange(): void {

    const patient = this.patients.find(
      p => String(p.id) === this.discharge.patientId
    );

    if (patient) {
      this.discharge.patientName = patient.name;
      const admission = this.activeAdmissions.find(item => item.patientId === patient.id);
      if (admission) {
        this.discharge.admissionDate = admission.admissionDate;
        this.discharge.room = admission.ward;
        this.discharge.bed = admission.bed;
        this.discharge.doctorName = admission.doctor;
        this.discharge.department = admission.department;
      }
    }
  }

  saveDischarge(): void {

    if (
      !this.discharge.patientName ||
      !this.discharge.patientId ||
      !this.discharge.dischargeDate ||
      !this.discharge.diagnosis
    ) {
      alert('Please fill in all required fields.');
      return;
    }
    if (!this.activeAdmissions.some(item => item.patientId === Number(this.discharge.patientId))) {
      alert('Choose a patient with an active admission before discharging.');
      return;
    }

    if (this.isEditMode) {

      this.dischargeService.updateDischarge(this.dischargeId!, this.discharge).subscribe({
        next: () => { alert('ছাড়পত্র হালনাগাদ হয়েছে।'); this.router.navigate(['/admin/discharge']); },
        error: error => console.error('ছাড়পত্র হালনাগাদ ব্যর্থ', error)
      });

    } else {

      this.dischargeService.addDischarge(this.discharge).subscribe({
        next: () => { alert('ছাড়পত্র সংরক্ষিত হয়েছে।'); this.router.navigate(['/admin/discharge']); },
        error: error => console.error('ছাড়পত্র সংরক্ষণ ব্যর্থ', error)
      });
    }

  }

  cancel(): void {
    this.router.navigate(['/admin/discharge']);
  }
}
