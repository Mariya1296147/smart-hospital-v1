import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Consultation } from '../../../models/consultation';
import { ConsultationService } from '../../../core/services/consultation.service';

@Component({
  selector: 'app-consultation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './consultation-form.component.html',
  styleUrl: './consultation-form.component.css'
})
export class ConsultationFormComponent implements OnInit {

  isEditMode = false;
  consultationId: number | null = null;

  consultation: Consultation = {
    id: 0,
    consultationId: '',
    patientName: '',
    patientId: '',
    doctorName: '',
    department: '',
    date: '',
    time: '',
    type: '',
    symptoms: '',
    diagnosis: '',
    notes: '',
    prescription: '',
    status: 'Pending'
  };

  patients = [
    {
      name: 'Mariya Rahman',
      id: 'P-1001'
    },
    {
      name: 'Sarah Ahmed',
      id: 'P-1002'
    },
    {
      name: 'Karim Hasan',
      id: 'P-1003'
    },
    {
      name: 'Nusrat Akter',
      id: 'P-1004'
    },
    {
      name: 'Imran Hossain',
      id: 'P-1005'
    }
  ];

  doctors = [
    'Dr. Ahmed Rahman',
    'Dr. Rahim Khan',
    'Dr. Nusrat Jahan',
    'Dr. Tanvir Hasan',
    'Dr. Maria Akter',
    'Dr. Karim Hasan'
  ];

  departments = [
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Dermatology',
    'Medicine',
    'Surgery',
    'Gynecology',
    'ENT',
    'Ophthalmology'
  ];

  consultationTypes = [
    'New Consultation',
    'Follow-up',
    'Emergency Consultation'
  ];

  constructor(
    private consultationService: ConsultationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.consultationId = Number(id);

      const existingConsultation =
        this.consultationService.getConsultationById(
          this.consultationId
        );

      if (existingConsultation) {
        this.consultation = {
          ...existingConsultation
        };
      }
    } else {
      this.generateConsultationId();
    }
  }

  generateConsultationId(): void {

    const consultations =
      this.consultationService.getConsultations();

    const nextNumber =
      consultations.length > 0
        ? Math.max(...consultations.map(c => c.id)) + 1000
        : 1001;

    this.consultation.consultationId =
      `CON-${nextNumber}`;
  }

  onPatientChange(): void {

    const patient = this.patients.find(
      p => p.name === this.consultation.patientName
    );

    if (patient) {
      this.consultation.patientId = patient.id;
    }
  }

  saveConsultation(): void {

    if (
      !this.consultation.patientName ||
      !this.consultation.doctorName ||
      !this.consultation.department ||
      !this.consultation.date ||
      !this.consultation.time ||
      !this.consultation.type
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    if (this.isEditMode) {

      this.consultationService.updateConsultation(
        this.consultation
      );

      alert('Consultation updated successfully!');

    } else {

      this.consultationService.addConsultation(
        this.consultation
      );

      alert('Consultation added successfully!');
    }

    this.router.navigate(['/admin/consultations']);
  }

  cancel(): void {
    this.router.navigate(['/admin/consultations']);
  }
}