import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdmissionService } from '../../core/services/admission.service';
import { NurseCareService } from '../../core/services/nurse-care.service';
import { NursingNoteRecord, VitalSignRecord } from '../../models/nurse-care';
import { Patient } from '../../models/patient';

@Component({
  selector: 'app-nurse-care',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nurse-care.component.html'
})
export class NurseCareComponent implements OnInit {
  kind: 'vitals' | 'notes' = 'vitals';
  patients: Patient[] = [];
  vitals: VitalSignRecord[] = [];
  notes: NursingNoteRecord[] = [];
  selectedPatientId?: number;
  temperatureC?: number;
  pulseBpm?: number;
  respiratoryRate?: number;
  systolicBp?: number;
  diastolicBp?: number;
  oxygenSaturation?: number;
  note = '';
  loading = false;
  saving = false;
  error = '';

  constructor(private readonly route: ActivatedRoute, private readonly care: NurseCareService,
              private readonly admissionsService: AdmissionService) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.kind = data['nurseCareKind'] === 'notes' ? 'notes' : 'vitals';
      this.load();
    });
    this.route.queryParamMap.subscribe(params => {
      const patientId = Number(params.get('patientId'));
      this.selectedPatientId = Number.isFinite(patientId) && patientId > 0 ? patientId : undefined;
    });
    this.admissionsService.getAdmissions().subscribe({
      next: admissions => {
        const active = (admissions ?? []).filter(item => ['ADMITTED', 'ACTIVE', 'IN_PROGRESS'].includes(String(item.status ?? '').toUpperCase()));
        const seen = new Set<number>();
        this.patients = active.filter(item => {
          const id = Number(item.patientId);
          if (!Number.isFinite(id) || id <= 0 || seen.has(id)) return false;
          seen.add(id);
          return true;
        }).map(item => ({
          id: item.patientId,
          patientId: item.patientCode ?? '',
          name: item.patientName,
          email: '',
          phone: item.patientPhone,
          age: item.patientAge,
          gender: item.patientGender,
          status: item.status
        }));
        if (this.selectedPatientId && !this.patients.some(patient => Number(patient.id) === this.selectedPatientId)) {
          this.selectedPatientId = undefined;
        }
      },
      error: () => this.error = 'Admitted patients in your assigned ward could not be loaded.'
    });
  }

  load(): void {
    this.loading = true;
    this.error = '';
    const onError = (error: any) => {
      this.error = error?.error?.message || 'Nursing records could not be loaded.';
      this.loading = false;
    };
    if (this.kind === 'vitals') {
      this.care.getVitalSigns().subscribe({ next: items => { this.vitals = items ?? []; this.loading = false; }, error: onError });
    } else {
      this.care.getNursingNotes().subscribe({ next: items => { this.notes = items ?? []; this.loading = false; }, error: onError });
    }
  }

  save(): void {
    if (!this.selectedPatientId) { this.error = 'Select an admitted patient assigned to your ward.'; return; }
    this.saving = true;
    this.error = '';
    const onSuccess = () => {
      this.saving = false;
      this.temperatureC = this.pulseBpm = this.respiratoryRate = this.systolicBp = this.diastolicBp = this.oxygenSaturation = undefined;
      this.note = '';
      this.load();
    };
    const onError = (error: any) => { this.error = error?.error?.message || 'The nursing record could not be saved.'; this.saving = false; };
    if (this.kind === 'vitals') {
      this.care.addVitalSigns({ patientId: Number(this.selectedPatientId), temperatureC: this.temperatureC,
        pulseBpm: this.pulseBpm, respiratoryRate: this.respiratoryRate, systolicBp: this.systolicBp,
        diastolicBp: this.diastolicBp, oxygenSaturation: this.oxygenSaturation }).subscribe({ next: onSuccess, error: onError });
    } else {
      this.care.addNursingNote({ patientId: Number(this.selectedPatientId), note: this.note }).subscribe({ next: onSuccess, error: onError });
    }
  }
}
