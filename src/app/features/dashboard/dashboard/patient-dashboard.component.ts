import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AdmissionService } from '../../../core/services/admission.service';
import { BillingService } from '../../../core/services/billing.service';
import { ConsultationService } from '../../../core/services/consultation.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DischargeService } from '../../../core/services/discharge.service';
import { LaboratoryService } from '../../../core/services/laboratory.service';
import { PatientService } from '../../../core/services/patient.service';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { Appointment } from '../../../models/appointment';
import { Admission } from '../../../models/admission';
import { Billing } from '../../../models/billing';
import { Consultation } from '../../../models/consultation';
import { DashboardSummary } from '../../../models/dashboard';
import { Discharge } from '../../../models/discharge';
import { Laboratory } from '../../../models/laboratory';
import { Patient } from '../../../models/patient';
import { Prescription } from '../../../models/prescription';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.css'
})
export class PatientDashboardComponent implements OnInit {
  patient: Patient | null = null;
  summary: DashboardSummary | null = null;
  appointments: Appointment[] = [];
  prescriptions: Prescription[] = [];
  tests: Laboratory[] = [];
  bills: Billing[] = [];
  admissions: Admission[] = [];
  consultations: Consultation[] = [];
  discharges: Discharge[] = [];
  loading = true;

  constructor(
    private readonly patientsApi: PatientService,
    private readonly appointmentsApi: AppointmentService,
    private readonly prescriptionsApi: PrescriptionService,
    private readonly laboratoryApi: LaboratoryService,
    private readonly billingApi: BillingService,
    private readonly admissionsApi: AdmissionService,
    private readonly consultationsApi: ConsultationService,
    private readonly dischargesApi: DischargeService,
    private readonly dashboardApi: DashboardService
  ) {}

  ngOnInit(): void {
    this.dashboardApi.getSummary().subscribe({
      next: summary => this.summary = summary,
      error: error => console.error('Patient dashboard metrics failed to load', error)
    });
    forkJoin({
      patient: this.patientsApi.getMyPatient().pipe(catchError(() => of(null))),
      appointments: this.appointmentsApi.getAppointments().pipe(catchError(() => of([]))),
      prescriptions: this.prescriptionsApi.getPrescriptions().pipe(catchError(() => of([]))),
      tests: this.laboratoryApi.getLaboratoryTests().pipe(catchError(() => of([]))),
      bills: this.billingApi.getBills().pipe(catchError(() => of([]))),
      admissions: this.admissionsApi.getAdmissions().pipe(catchError(() => of([]))),
      consultations: this.consultationsApi.getConsultations().pipe(catchError(() => of([]))),
      discharges: this.dischargesApi.getDischarges().pipe(catchError(() => of([])))
    }).subscribe(result => {
      this.patient = result.patient;
      this.appointments = result.appointments;
      this.prescriptions = result.prescriptions;
      this.tests = result.tests;
      this.bills = result.bills;
      this.admissions = result.admissions;
      this.consultations = result.consultations;
      this.discharges = result.discharges;
      this.loading = false;
    });
  }

  metric(name: string): number { return this.summary?.metrics?.[name] ?? 0; }
}
