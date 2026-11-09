import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { AdmissionService } from '../../../core/services/admission.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { LaboratoryService } from '../../../core/services/laboratory.service';
import { NurseCareService } from '../../../core/services/nurse-care.service';
import { NurseService } from '../../../core/services/nursing.service';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { Admission } from '../../../models/admission';
import { DashboardSummary } from '../../../models/dashboard';
import { Laboratory } from '../../../models/laboratory';
import { NursingNoteRecord, VitalSignRecord } from '../../../models/nurse-care';
import { Nurse } from '../../../models/nursing';
import { Prescription } from '../../../models/prescription';

interface NursingActivity { category: string; patientName: string; description: string; recordedAt: string; }

@Component({
  selector: 'app-nurse-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './nurse-dashboard.component.html',
  styleUrl: './nurse-dashboard.component.css'
})
export class NurseDashboardComponent implements OnInit {
  summary: DashboardSummary | null = null;
  nurse: Nurse | null = null;
  admissions: Admission[] = [];
  prescriptions: Prescription[] = [];
  labTests: Laboratory[] = [];
  vitals: VitalSignRecord[] = [];
  notes: NursingNoteRecord[] = [];
  loading = true;
  profileUnavailable = false;

  constructor(private readonly dashboard: DashboardService,
              private readonly admissionService: AdmissionService,
              private readonly nurseService: NurseService,
              private readonly prescriptionService: PrescriptionService,
              private readonly laboratoryService: LaboratoryService,
              private readonly nurseCareService: NurseCareService) {}

  ngOnInit(): void {
    forkJoin({
      summary: this.dashboard.getSummary().pipe(catchError(() => of(null))),
      nurse: this.nurseService.getMyProfile().pipe(catchError(() => of(null))),
      admissions: this.admissionService.getAdmissions().pipe(catchError(() => of([]))),
      prescriptions: this.prescriptionService.getPrescriptions().pipe(catchError(() => of([]))),
      laboratories: this.laboratoryService.getLaboratoryTests().pipe(catchError(() => of([]))),
      vitals: this.nurseCareService.getVitalSigns().pipe(catchError(() => of([]))),
      notes: this.nurseCareService.getNursingNotes().pipe(catchError(() => of([])))
    }).subscribe(data => {
      this.summary = data.summary;
      this.nurse = data.nurse;
      this.profileUnavailable = data.nurse == null;
      const orderedAdmissions = (data.admissions ?? [])
        .filter(item => this.isAdmitted(item.status))
        .sort((a, b) => new Date(b.admissionDate || 0).getTime() - new Date(a.admissionDate || 0).getTime());
      const seenPatients = new Set<number>();
      this.admissions = orderedAdmissions.filter(item => {
        const patientId = Number(item.patientId);
        if (!Number.isFinite(patientId) || patientId <= 0 || seenPatients.has(patientId)) return false;
        seenPatients.add(patientId);
        return true;
      });
      this.prescriptions = data.prescriptions ?? [];
      this.labTests = data.laboratories ?? [];
      this.vitals = data.vitals ?? [];
      this.notes = data.notes ?? [];
      this.loading = false;
    });
  }

  metric(name: string): number { return this.summary?.metrics?.[name] ?? 0; }
  isAdmitted(status: string | null | undefined): boolean { return ['ADMITTED', 'ACTIVE', 'IN_PROGRESS'].includes(String(status ?? '').toUpperCase()); }

  get activePatientIds(): Set<number> { return new Set(this.admissions.map(admission => Number(admission.patientId)).filter(Number.isFinite)); }

  get activityFeed(): NursingActivity[] {
    const patientIds = this.activePatientIds;
    const activities: NursingActivity[] = [];
    for (const prescription of this.prescriptions) {
      if (!patientIds.has(Number(prescription.patientId))) continue;
      for (const medicine of prescription.medicines ?? []) {
        activities.push({ category: 'Medication order', patientName: prescription.patientName,
          description: [medicine.medicineName, medicine.dosage, medicine.frequency, medicine.duration].filter(Boolean).join(' · '),
          recordedAt: prescription.date });
      }
    }
    for (const lab of this.labTests) {
      const patient = this.admissions.find(admission => admission.patientCode === lab.patientId);
      if (patient) activities.push({ category: 'Lab test request', patientName: patient.patientName,
        description: `${lab.testName || 'Test'} · ${lab.status || 'Pending'}`, recordedAt: lab.sampleDate });
    }
    for (const vital of this.vitals) {
      if (patientIds.has(Number(vital.patientId))) activities.push({ category: 'Vital signs', patientName: vital.patientName,
        description: this.vitalSummary(vital), recordedAt: vital.recordedAt });
    }
    for (const note of this.notes) {
      if (patientIds.has(Number(note.patientId))) activities.push({ category: 'Nursing note', patientName: note.patientName,
        description: note.note, recordedAt: note.recordedAt });
    }
    return activities.sort((a, b) => new Date(b.recordedAt || 0).getTime() - new Date(a.recordedAt || 0).getTime()).slice(0, 8);
  }

  private vitalSummary(vital: VitalSignRecord): string {
    const values = [vital.temperatureC != null ? `${vital.temperatureC} °C` : '',
      vital.pulseBpm != null ? `Pulse ${vital.pulseBpm}` : '',
      vital.systolicBp != null ? `BP ${vital.systolicBp}/${vital.diastolicBp}` : '',
      vital.oxygenSaturation != null ? `SpO₂ ${vital.oxygenSaturation}%` : ''].filter(Boolean);
    return values.join(' · ') || 'Vital signs recorded';
  }
}
