import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { DischargeService } from '../../../core/services/discharge.service';
import { Discharge } from '../../../models/discharge';

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

  patients = [
    { id: 'P-1001', name: 'Mariya Rahman' },
    { id: 'P-1002', name: 'Sarah Ahmed' },
    { id: 'P-1003', name: 'Karim Hasan' },
    { id: 'P-1004', name: 'Nusrat Akter' },
    { id: 'P-1005', name: 'Imran Hossain' }
  ];

  doctors = [
    'Dr. Ahmed Rahman',
    'Dr. Rahim Khan',
    'Dr. Nusrat Jahan',
    'Dr. Tanvir Hasan',
    'Dr. Maria Akter'
  ];

  departments = [
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Dermatology',
    'Medicine',
    'Surgery'
  ];

  dischargeTypes = [
    'Normal',
    'Against Medical Advice',
    'Transfer',
    'Death'
  ];

  constructor(
    private dischargeService: DischargeService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.dischargeId = Number(id);

      const existingDischarge =
        this.dischargeService.getDischargeById(this.dischargeId);

      if (existingDischarge) {
        this.discharge = { ...existingDischarge };
      }
    } else {
      this.generateDischargeId();
    }
  }

  generateDischargeId(): void {
    const discharges = this.dischargeService.getDischarges();

    const nextNumber = discharges.length > 0
      ? Math.max(...discharges.map(d => d.id)) + 1000
      : 1001;

    this.discharge.dischargeId = `DIS-${nextNumber}`;
  }

  onPatientChange(): void {

    const patient = this.patients.find(
      p => p.id === this.discharge.patientId
    );

    if (patient) {
      this.discharge.patientName = patient.name;
    }
  }

  saveDischarge(): void {

    if (
      !this.discharge.patientName ||
      !this.discharge.patientId ||
      !this.discharge.doctorName ||
      !this.discharge.department ||
      !this.discharge.admissionDate ||
      !this.discharge.dischargeDate ||
      !this.discharge.room ||
      !this.discharge.bed ||
      !this.discharge.diagnosis
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    if (this.isEditMode) {

      this.dischargeService.updateDischarge(this.discharge);

      alert('Discharge record updated successfully!');

    } else {

      this.dischargeService.addDischarge(this.discharge);

      alert('Discharge record added successfully!');
    }

    this.router.navigate(['/admin/discharge']);
  }

  cancel(): void {
    this.router.navigate(['/admin/discharge']);
  }
}