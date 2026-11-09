import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdmissionService } from '../../../core/services/admission.service';
import { DepartmentService } from '../../../core/services/department.service';
import { FacilityService, BedOption, WardOption } from '../../../core/services/facility.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { NurseCareService } from '../../../core/services/nurse-care.service';
import { NurseService } from '../../../core/services/nursing.service';
import { PatientService } from '../../../core/services/patient.service';
import { Admission } from '../../../models/admission';
import { Department } from '../../../models/department';
import { Doctor } from '../../../models/doctor';
import { Patient } from '../../../models/patient';
import { Nurse } from '../../../models/nursing';

@Component({
  selector: 'app-admission-workflow',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admission-workflow.component.html',
  styleUrl: './admission-workflow.component.css'
})
export class AdmissionWorkflowComponent implements OnInit {
  readonly steps = ['Identify & register', 'Bed assignment', 'Initial assessment', 'Vital signs', 'Allergies & history', 'Nursing notes', 'Physician notification', 'Confirm admission'];
  step = 1;
  patientMode: 'new' | 'existing' = 'new';
  identityVerified = false;
  patients: Patient[] = [];
  selectedPatientId?: number;
  patient?: Patient;
  departments: Department[] = [];
  doctors: Doctor[] = [];
  wards: WardOption[] = [];
  private allAvailableWards: WardOption[] = [];
  private nurseWardName = '';
  beds: BedOption[] = [];
  loadingReferences = false;
  loadingBeds = false;
  saving = false;
  error = '';
  success = '';
  wardError = '';
  admissionSaved = false;
  vitalsSaved = false;
  noteSaved = false;
  completedAdmission?: Admission;
  completionFinished = false;

  registration = {
    firstName: '', lastName: '', gender: '', age: undefined as number | undefined,
    phone: '', email: '', address: '', emergencyContact: '', bloodGroup: '', departmentId: undefined as number | undefined,
    allergies: '', medicalHistory: ''
  };
  assessment = {
    arrivalMode: '', arrivalTime: this.nowLocal(), chiefComplaint: '', painScore: undefined as number | undefined,
    consciousness: '', mobility: '', fallRisk: '', assessmentNote: ''
  };
  vitals = {
    temperatureC: undefined as number | undefined, pulseBpm: undefined as number | undefined,
    respiratoryRate: undefined as number | undefined, systolicBp: undefined as number | undefined,
    diastolicBp: undefined as number | undefined, oxygenSaturation: undefined as number | undefined
  };
  nursingNote = '';
  admission = {
    admissionDate: this.todayLocal(), departmentId: undefined as number | undefined,
    doctorId: undefined as number | undefined, wardId: undefined as number | undefined,
    bedId: undefined as number | undefined, reason: ''
  };
  allergyHistory = { allergies: '', medicalHistory: '' };
  physicianNotification = {
    needed: false, notified: false, physician: '', notifiedAt: this.nowLocal(),
    method: '', reason: '', response: ''
  };

  constructor(
    private readonly patientService: PatientService,
    private readonly departmentService: DepartmentService,
    private readonly doctorService: DoctorService,
    private readonly facilityService: FacilityService,
    private readonly admissionService: AdmissionService,
    private readonly nurseCare: NurseCareService,
    private readonly nurseService: NurseService
  ) {}

  ngOnInit(): void {
    this.loadingReferences = true;
    let remaining = 5;
    const done = () => { if (--remaining === 0) this.loadingReferences = false; };
    this.patientService.getPatients().subscribe({ next: items => this.patients = items ?? [], error: e => { this.error = this.message(e, 'Patient records could not be loaded.'); done(); }, complete: done });
    this.departmentService.getAll().subscribe({ next: items => this.departments = items ?? [], error: e => { this.error = this.message(e, 'Departments could not be loaded.'); done(); }, complete: done });
    this.doctorService.getDoctors().subscribe({ next: items => this.doctors = items ?? [], error: e => { this.error = this.message(e, 'Doctors could not be loaded.'); done(); }, complete: done });
    this.nurseService.getMyProfile().subscribe({
      next: (profile: Nurse) => { this.nurseWardName = profile.ward?.trim() ?? ''; this.applyAssignedWard(); },
      error: e => { this.error = this.message(e, 'Your nurse profile could not be loaded. Ask an administrator to link your nurse account.'); done(); },
      complete: done
    });
    this.facilityService.getAvailableWards().subscribe({
      next: items => { this.allAvailableWards = items ?? []; this.applyAssignedWard(); },
      error: e => { this.wardError = this.message(e, 'Available wards could not be loaded.'); done(); },
      complete: done
    });
  }

  private applyAssignedWard(): void {
    this.wards = this.nurseWardName
      ? this.allAvailableWards.filter(ward => ward.wardName.trim().toLowerCase() === this.nurseWardName.toLowerCase())
      : [];
    if (this.allAvailableWards.length && !this.nurseWardName) {
      this.wardError = 'Your nurse profile has no assigned ward. Ask an administrator to assign your ward before starting an admission.';
    } else if (this.nurseWardName && this.allAvailableWards.length && !this.wards.length) {
      this.wardError = `Your assigned ward (${this.nurseWardName}) is not available for admission.`;
    }
  }

  get departmentDoctors(): Doctor[] {
    return this.doctors.filter(d => !this.admission.departmentId || Number(d.departmentId) === Number(this.admission.departmentId)
      || this.departments.find(dep => dep.id === this.admission.departmentId)?.departmentName === d.department);
  }

  get availableBeds(): BedOption[] {
    return this.beds.filter(bed => String(bed.status ?? '').trim().toUpperCase() === 'AVAILABLE');
  }

  get physicianNamePlaceholder(): string {
    return this.doctors.find(item => Number(item.id) === Number(this.admission.doctorId))?.name || 'Physician name';
  }

  get selectedBedLabel(): string {
    const ward = this.wards.find(item => Number(item.id) === Number(this.admission.wardId))?.wardName;
    const bed = this.beds.find(item => Number(item.id) === Number(this.admission.bedId))?.bedNumber;
    return ward && bed ? `${ward} / ${bed}` : 'Bed assignment pending';
  }

  get selectedClinicalTeamLabel(): string {
    const department = this.departments.find(item => Number(item.id) === Number(this.admission.departmentId))?.departmentName;
    const doctor = this.doctors.find(item => Number(item.id) === Number(this.admission.doctorId))?.name;
    return [department, doctor].filter(Boolean).join(' · ');
  }

  setMode(mode: 'new' | 'existing'): void {
    this.patientMode = mode;
    this.patient = undefined;
    this.selectedPatientId = undefined;
    this.identityVerified = false;
    this.error = '';
  }

  selectExistingPatient(): void {
    this.patient = this.patients.find(item => Number(item.id) === Number(this.selectedPatientId));
    this.identityVerified = false;
  }

  continueRegistration(): void {
    this.error = '';
    if (!this.identityVerified) { this.error = 'Confirm the patient identity using the name and a second identifier before continuing.'; return; }
    if (this.patientMode === 'existing') {
      if (!this.patient) { this.error = 'Select a patient to continue.'; return; }
      this.preparePatientDetails();
      this.step = 2;
      return;
    }
    const firstName = this.registration.firstName.trim();
    const lastName = this.registration.lastName.trim();
    if (!firstName || !lastName || !this.registration.gender || this.registration.age == null
      || !this.registration.phone.trim() || !this.registration.email.trim() || !this.registration.departmentId) {
      this.error = 'Complete the required patient registration fields before continuing.';
      return;
    }
    const registrationDepartment = this.departments.find(item => Number(item.id) === Number(this.registration.departmentId));
    if (!registrationDepartment) { this.error = 'Select a valid patient department.'; return; }
    this.saving = true;
    this.patientService.addPatient({
      firstName, lastName, name: `${firstName} ${lastName}`, gender: this.registration.gender,
      age: Number(this.registration.age), phone: this.registration.phone.trim(), email: this.registration.email.trim(),
      address: this.registration.address.trim(), emergencyContact: this.registration.emergencyContact.trim(),
      bloodGroup: this.registration.bloodGroup, allergies: this.registration.allergies.trim(),
      medicalHistory: this.registration.medicalHistory.trim(),
      department: registrationDepartment.departmentName, status: 'Active'
    }).subscribe({
      next: patient => {
        this.patient = patient;
        this.patients = [patient, ...this.patients.filter(item => item.id !== patient.id)];
        this.selectedPatientId = patient.id;
        this.admission.departmentId = registrationDepartment.id;
        this.preparePatientDetails();
        this.step = 2;
        this.saving = false;
        this.success = `Patient ${patient.patientId} registered.`;
      },
      error: e => { this.error = this.message(e, 'Patient registration could not be saved.'); this.saving = false; }
    });
  }

  private preparePatientDetails(): void {
    this.allergyHistory = {
      allergies: this.patient?.allergies ?? '',
      medicalHistory: this.patient?.medicalHistory ?? ''
    };
  }

  continueBedAssignment(): void {
    this.error = '';
    if (!this.admission.admissionDate || !this.admission.departmentId || !this.admission.doctorId
      || !this.admission.wardId || !this.admission.bedId) {
      this.error = 'Select an admission date, department, doctor, ward, and available bed.';
      return;
    }
    if (!this.validateBedAndTeam()) return;
    this.step = 3;
  }

  continueAssessment(): void {
    this.error = '';
    if (!this.assessment.arrivalMode || !this.assessment.chiefComplaint.trim() || !this.assessment.consciousness
      || !this.assessment.mobility || !this.assessment.fallRisk || !this.assessment.assessmentNote.trim()) {
      this.error = 'Complete the arrival details and initial assessment before continuing.';
      return;
    }
    this.prepareNursingNote();
    this.step = 4;
  }

  private prepareNursingNote(): void {
    this.nursingNote = [
      'Patient identity confirmed using name and a second identifier.',
      `Admission assessment (${this.assessment.arrivalTime.replace('T', ' ')}): ${this.assessment.assessmentNote.trim()}`,
      `Arrival: ${this.assessment.arrivalMode}; complaint: ${this.assessment.chiefComplaint.trim()}.`,
      `Consciousness: ${this.assessment.consciousness}; mobility: ${this.assessment.mobility}; fall risk: ${this.assessment.fallRisk}.`,
      this.allergyHistory.allergies.trim() ? `Known allergies: ${this.allergyHistory.allergies.trim()}.` : 'Allergies: none reported or documented.',
      this.allergyHistory.medicalHistory.trim() ? `Relevant history: ${this.allergyHistory.medicalHistory.trim()}.` : 'Relevant medical history: none reported or documented.',
      this.assessment.painScore == null ? '' : `Pain score: ${this.assessment.painScore}/10.`
    ].filter(Boolean).join(' ');
  }

  continueVitals(): void {
    const v = this.vitals;
    if ([v.temperatureC, v.pulseBpm, v.respiratoryRate, v.systolicBp, v.diastolicBp, v.oxygenSaturation].some(value => value == null)) {
      this.error = 'Record all six vital signs before continuing.';
      return;
    }
    if (v.temperatureC! < 25 || v.temperatureC! > 45 || v.pulseBpm! < 20 || v.pulseBpm! > 250
      || v.respiratoryRate! < 4 || v.respiratoryRate! > 80 || v.systolicBp! < 40 || v.systolicBp! > 300
      || v.diastolicBp! < 20 || v.diastolicBp! > 200 || v.oxygenSaturation! < 50 || v.oxygenSaturation! > 100) {
      this.error = 'Check the vital-sign ranges and correct any values outside the accepted limits.';
      return;
    }
    this.error = '';
    this.step = 5;
  }

  saveAllergyHistory(): void {
    if (!this.patient?.id) { this.error = 'A registered patient is required to save allergy and medical history.'; return; }
    if (!this.allergyHistory.allergies.trim() || !this.allergyHistory.medicalHistory.trim()) {
      this.error = 'Document allergies and medical history, or explicitly enter none reported / unknown.';
      return;
    }
    this.saving = true;
    this.error = '';
    this.patientService.updatePatient(this.patient.id, {
      allergies: this.allergyHistory.allergies.trim(),
      medicalHistory: this.allergyHistory.medicalHistory.trim(),
      department: this.departments.find(item => Number(item.id) === Number(this.admission.departmentId))?.departmentName,
      doctor: this.doctors.find(item => Number(item.id) === Number(this.admission.doctorId))?.name
    }).subscribe({
      next: patient => { this.patient = patient; this.prepareNursingNote(); this.saving = false; this.step = 6; },
      error: e => { this.error = this.message(e, 'Allergy and medical history could not be saved.'); this.saving = false; }
    });
  }

  onWardChange(): void {
    this.admission.bedId = undefined;
    this.beds = [];
    if (!this.admission.wardId) return;
    this.loadingBeds = true;
    this.facilityService.getAvailableBeds(Number(this.admission.wardId)).subscribe({
      next: items => { this.beds = items ?? []; this.loadingBeds = false; },
      error: e => { this.wardError = this.message(e, 'Available beds could not be loaded.'); this.loadingBeds = false; }
    });
  }

  onDoctorChange(): void {
    const doctor = this.doctors.find(item => Number(item.id) === Number(this.admission.doctorId));
    if (!doctor) return;
    const department = this.departments.find(item => item.departmentName === doctor.department);
    if (department) this.admission.departmentId = department.id;
  }

  completeAdmission(): void {
    this.error = '';
    this.success = '';
    if (!this.patient?.id) { this.error = 'A registered patient is required to complete admission.'; return; }
    if (!this.nursingNote.trim()) { this.error = 'Add the initial nursing note before completing admission.'; return; }
    if (this.physicianNotification.needed && (!this.physicianNotification.notified || !this.physicianNotification.physician.trim()
      || !this.physicianNotification.notifiedAt || !this.physicianNotification.method || !this.physicianNotification.reason.trim())) {
      this.error = 'Document who was notified, when, how, and the reason before completing admission.';
      return;
    }
    if (this.buildFinalNursingNote().length > 4000) {
      this.error = 'The nursing note and physician notification details exceed the 4,000 character limit. Shorten the note or details.';
      return;
    }
    if (!this.admission.admissionDate || !this.admission.departmentId || !this.admission.doctorId
      || !this.admission.wardId || !this.admission.bedId || !this.admission.reason.trim()) {
      this.error = 'Complete the admission date, clinical team, ward, available bed, and reason.';
      return;
    }
    if (!this.validateBedAndTeam()) return;
    const selectedDepartment = this.departments.find(item => Number(item.id) === Number(this.admission.departmentId))!;
    const selectedDoctor = this.doctors.find(item => Number(item.id) === Number(this.admission.doctorId))!;
    const selectedWard = this.wards.find(item => Number(item.id) === Number(this.admission.wardId))!;
    const selectedBed = this.availableBeds.find(item => Number(item.id) === Number(this.admission.bedId))!;
    this.saving = true;
    if (this.admissionSaved) {
      this.saveVitals();
      return;
    }
    const payload: Partial<Admission> = {
      admissionId: '', patientId: this.patient.id, patientName: this.patient.name,
      patientCode: this.patient.patientId, patientPhone: this.patient.phone, patientAge: this.patient.age,
      patientGender: this.patient.gender, departmentId: selectedDepartment.id, department: selectedDepartment.departmentName,
      doctorId: selectedDoctor.id, doctor: selectedDoctor.name, admissionDate: this.admission.admissionDate,
      wardId: selectedWard.id, ward: selectedWard.wardName, bedId: selectedBed.id, bed: selectedBed.bedNumber,
      bedType: selectedBed.bedType ?? undefined, reason: this.admission.reason.trim(), status: 'Admitted'
    };
    this.admissionService.addAdmission(payload).subscribe({
      next: item => { this.admissionSaved = true; this.completedAdmission = item; this.saveVitals(); },
      error: e => { this.error = this.message(e, 'The admission record could not be saved.'); this.saving = false; }
    });
  }

  private saveVitals(): void {
    if (this.vitalsSaved) { this.saveNote(); return; }
    this.nurseCare.addVitalSigns({ patientId: Number(this.patient?.id), ...this.vitals }).subscribe({
      next: () => { this.vitalsSaved = true; this.saveNote(); },
      error: e => { this.error = this.message(e, 'Admission was saved, but vital signs could not be recorded. Retry completion to continue.'); this.saving = false; }
    });
  }

  private saveNote(): void {
    if (this.noteSaved) { this.finish(); return; }
    const note = this.buildFinalNursingNote();
    this.nurseCare.addNursingNote({ patientId: Number(this.patient?.id), note }).subscribe({
      next: () => { this.noteSaved = true; this.finish(); },
      error: e => { this.error = this.message(e, 'Admission and vital signs were saved, but the nursing note could not be recorded. Retry completion to continue.'); this.saving = false; }
    });
  }

  private finish(): void {
    this.saving = false;
    this.step = 8;
    this.completionFinished = true;
    this.success = `Admission ${this.completedAdmission?.admissionId || ''} completed for ${this.patient?.name}.`.trim();
  }

  private validateBedAndTeam(): boolean {
    const department = this.departments.find(item => Number(item.id) === Number(this.admission.departmentId));
    const doctor = this.doctors.find(item => Number(item.id) === Number(this.admission.doctorId));
    const ward = this.wards.find(item => Number(item.id) === Number(this.admission.wardId));
    const bed = this.availableBeds.find(item => Number(item.id) === Number(this.admission.bedId));
    if (!department || !doctor || !ward || !bed) {
      this.error = 'One of the selected clinical or bed assignments is no longer available. Review the selections and try again.';
      return false;
    }
    if ((doctor.departmentId && Number(doctor.departmentId) !== Number(department.id))
      || (doctor.department && doctor.department.trim().toLowerCase() !== department.departmentName.trim().toLowerCase())) {
      this.error = 'Choose a physician from the selected department.';
      return false;
    }
    const bedWardId = typeof bed.ward === 'number' ? bed.ward : bed.ward?.id ?? bed.wardId;
    if (Number(bedWardId) !== Number(ward.id)) {
      this.error = 'Choose an available bed in the selected ward.';
      return false;
    }
    return true;
  }

  private buildFinalNursingNote(): string {
    const notificationNote = this.physicianNotification.needed
      ? `Physician notified: ${this.physicianNotification.physician.trim()} at ${this.physicianNotification.notifiedAt.replace('T', ' ')} via ${this.physicianNotification.method}. Reason: ${this.physicianNotification.reason.trim()}.${this.physicianNotification.response.trim() ? ` Response: ${this.physicianNotification.response.trim()}.` : ''}`
      : 'Physician notification: not required at initial admission assessment.';
    return `${this.nursingNote.trim()} ${notificationNote}`;
  }

  private message(error: any, fallback: string): string { return error?.error?.message || error?.message || fallback; }
  private todayLocal(): string { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
  private nowLocal(): string { const d = new Date(); const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return local.toISOString().slice(0, 16); }
}
