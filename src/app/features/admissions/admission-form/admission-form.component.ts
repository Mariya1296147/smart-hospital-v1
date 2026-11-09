import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

import { AdmissionService } from '../../../core/services/admission.service';
import { Admission } from '../../../models/admission';
import { PatientService } from '../../../core/services/patient.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { DepartmentService } from '../../../core/services/department.service';
import { FacilityService, WardOption, BedOption } from '../../../core/services/facility.service';
import { Patient } from '../../../models/patient';
import { Doctor } from '../../../models/doctor';
import { Department } from '../../../models/department';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-admission-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admission-form.component.html',
  styleUrl: './admission-form.component.css'
})
export class AdmissionFormComponent implements OnInit {

  isEdit = false;
  admissionId = 0;
  patients: Patient[] = [];
  doctors: Doctor[] = [];
  departments: Department[] = [];
  wards: WardOption[] = [];
  beds: BedOption[] = [];
  loading = false;
  loadingWards = false;
  loadingBeds = false;
  facilityError = '';
  private bedsLoadToken = 0;
  private persistedWardId?: number;
  private persistedBedId?: number;
  readonly isAccountsStaff: boolean;
  readonly basePath: string;

  admission: Admission = {
    id: 0,
    admissionId: '',
    patientName: '',
    department: '',
    doctor: '',
    admissionDate: '',
    ward: '',
    bed: '',
    reason: '',
    status: 'Admitted'
  };

  constructor(
    private admissionService: AdmissionService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private departmentService: DepartmentService,
    private facilityService: FacilityService,
    private router: Router,
    private route: ActivatedRoute,
    authService: AuthService
  ) {
    this.isAccountsStaff = authService.hasRole('ACCOUNTS_STAFF');
    this.basePath = this.isAccountsStaff ? '/accounts/admissions' : '/admin/admissions';
  }

  ngOnInit(): void {
    this.loadReferences();

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {

      this.isEdit = true;
      this.admissionId = Number(id);

      this.admissionService.getAdmissionById(this.admissionId).subscribe({
        next: existing => {
          this.admission = { ...existing };
          this.persistedWardId = existing.wardId;
          this.persistedBedId = existing.bedId;
          if (existing.wardId) this.loadBeds(existing.wardId);
        },
        error: error => console.error('ভর্তির তথ্য লোড করা যায়নি', error)
      });

    }

  }

  loadReferences(): void {
    this.patientService.getPatients().subscribe({ next: items => this.patients = items ?? [], error: error => console.error('Patients failed to load', error) });
    this.doctorService.getDoctors().subscribe({ next: items => this.doctors = items ?? [], error: error => console.error('Doctors failed to load', error) });
    this.departmentService.getAll().subscribe({ next: items => this.departments = items ?? [], error: error => console.error('Departments failed to load', error) });
    this.loadingWards = true;
    this.facilityError = '';
    this.facilityService.getAvailableWards().subscribe({
      next: items => { this.wards = items ?? []; this.loadingWards = false; },
      error: error => {
        console.error('Available wards failed to load', error);
        this.wards = [];
        this.loadingWards = false;
        this.facilityError = 'Available wards could not be loaded. Check your connection and try again.';
      }
    });
  }

  onWardChange(wardId: number | undefined): void {
    this.admission.wardId = wardId;
    this.admission.bedId = undefined;
    this.beds = [];
    if (wardId) this.loadBeds(Number(wardId));
  }

  private loadBeds(wardId: number): void {
    const requestToken = ++this.bedsLoadToken;
    this.loadingBeds = true;
    this.facilityError = '';
    this.facilityService.getAvailableBeds(wardId).subscribe({
      next: beds => {
        if (requestToken !== this.bedsLoadToken) return;
        this.beds = beds ?? [];
        this.loadingBeds = false;
      },
      error: error => {
        if (requestToken !== this.bedsLoadToken) return;
        console.error('Available beds and cabins failed to load', error);
        this.beds = [];
        this.loadingBeds = false;
        this.facilityError = 'Available beds and cabins could not be loaded. Check your connection and try again.';
      }
    });
  }

  get availableBeds(): BedOption[] {
    const selectedWardId = Number(this.admission.wardId);
    const selectedBedId = Number(this.admission.bedId);
    return this.beds.filter(bed => {
      const bedWardId = typeof bed.ward === 'number' ? bed.ward : bed.ward?.id ?? bed.wardId;
      const belongsToWard = !selectedWardId || Number(bedWardId) === selectedWardId;
      const isCurrentBed = this.isEdit && Number(bed.id) === selectedBedId;
      return belongsToWard && (String(bed.status ?? '').trim().toUpperCase() === 'AVAILABLE' || isCurrentBed);
    });
  }

  onPatientChange(): void {
    const patient = this.patients.find(item => item.id === Number(this.admission.patientId));
    if (patient) this.admission.patientName = patient.name;
  }

  onDoctorChange(): void {
    const doctor = this.doctors.find(item => item.id === Number(this.admission.doctorId));
    if (!doctor) return;
    this.admission.doctor = doctor.name;
    if (doctor.department) {
      this.admission.department = doctor.department;
      this.admission.departmentId = this.departments.find(d => d.departmentName === doctor.department)?.id;
    }
  }

  saveAdmission(): void {
    if (this.admission.status?.toUpperCase() === 'ADMITTED'
      && (!this.admission.wardId || !this.admission.bedId || !this.admission.admissionDate)) {
      alert('Select a ward, an available bed or cabin, and an admission date before confirming.');
      return;
    }
    const selectedWard = this.wards.find(item => Number(item.id) === Number(this.admission.wardId));
    const selectedBed = this.beds.find(item => Number(item.id) === Number(this.admission.bedId));
    const keepingExistingAllocation = this.isEdit
      && Number(this.admission.wardId) === Number(this.persistedWardId)
      && Number(this.admission.bedId) === Number(this.persistedBedId);
    if (this.admission.status?.toUpperCase() === 'ADMITTED'
      && !keepingExistingAllocation
      && (!selectedWard || !selectedBed || String(selectedBed.status).trim().toUpperCase() !== 'AVAILABLE'
        || Number(typeof selectedBed.ward === 'number' ? selectedBed.ward : selectedBed.ward?.id ?? selectedBed.wardId) !== Number(selectedWard.id))) {
      alert('Choose a currently available bed or cabin from the selected ward.');
      return;
    }
    if (this.admission.status?.toUpperCase() === 'PENDING' && this.admission.bedId) {
      alert('Pending requests cannot reserve a bed before confirmation.');
      return;
    }
    this.loading = true;
    const selectedPatient = this.patients.find(item => item.id === Number(this.admission.patientId));
    const selectedDoctor = this.doctors.find(item => item.id === Number(this.admission.doctorId));
    const selectedDepartment = this.departments.find(item => item.id === Number(this.admission.departmentId));
    const payload = {
      ...this.admission,
      wardId: selectedWard?.id ?? this.admission.wardId,
      bedId: selectedBed?.id ?? this.admission.bedId,
      patientName: selectedPatient?.name ?? this.admission.patientName,
      doctor: selectedDoctor?.name ?? this.admission.doctor,
      department: selectedDepartment?.departmentName ?? this.admission.department,
      ward: selectedWard?.wardName ?? this.admission.ward,
      bed: selectedBed?.bedNumber ?? this.admission.bed
    };

    if (this.isEdit) {

      this.admissionService.updateAdmission(this.admissionId, payload).subscribe({
        next: () => { alert('ভর্তির তথ্য হালনাগাদ হয়েছে।'); this.router.navigate([this.basePath]); },
        error: error => { console.error('ভর্তির তথ্য হালনাগাদ ব্যর্থ', error); alert(error.error?.message || error.message || 'Admission could not be saved.'); this.loading = false; }
      });

    } else {

      this.admissionService.addAdmission(payload).subscribe({
        next: () => { alert('ভর্তির তথ্য সংরক্ষিত হয়েছে।'); this.router.navigate([this.basePath]); },
        error: error => { console.error('ভর্তির তথ্য সংরক্ষণ ব্যর্থ', error); alert(error.error?.message || error.message || 'Admission could not be saved.'); this.loading = false; }
      });

    }

  }

}
