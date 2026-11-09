
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  Appointment,
  AppointmentService
} from '../../../core/services/appointment.service';
import { PatientService } from '../../../core/services/patient.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { DepartmentService } from '../../../core/services/department.service';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './appointment-form.component.html',
  styleUrl: './appointment-form.component.css'
})
export class AppointmentFormComponent implements OnInit {

  appointmentForm!: FormGroup;

  isEditMode = false;
  appointmentId!: number;

  patients: any[] = [];
  doctors: any[] = [];
  departments: any[] = [];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private departmentService: DepartmentService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.loadDropdownData();

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.appointmentId = Number(id);
      this.loadAppointment(this.appointmentId);
    }
  }

  createForm(): void {
    this.appointmentForm = this.fb.group({
      appointmentId: ['', Validators.required],
      patientId: ['', Validators.required],
      patientPhone: [
        '',
        Validators.pattern(/^[0-9]{11}$/)
      ],
      age: [null, Validators.min(0)],
      gender: [''],
      doctorId: ['', Validators.required],
      departmentId: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
      reason: ['', Validators.required],
      status: ['PENDING', Validators.required],
      notes: ['']
    });
  }

  loadDropdownData(): void {
    this.patientService.getPatients().subscribe({
      next: data => {
        this.patients = data || [];
      },
      error: error => {
        console.error('Patient loading failed:', error);
      }
    });

    this.doctorService.getDoctors().subscribe({
      next: (data: any[]) => {
        this.doctors = data || [];
      },
      error: error => {
        console.error('Doctor loading failed:', error);
      }
    });

    this.departmentService.getAll().subscribe({
      next: data => this.departments = (data ?? []).map(department => ({
        id: department.id,
        name: department.departmentName
      })),
      error: error => console.error('Department loading failed:', error)
    });
  }

  get departmentDoctors(): any[] {
    const department = this.departments.find(item => String(item.id) === String(this.appointmentForm?.get('departmentId')?.value));
    if (!department) return [];
    return this.doctors.filter(doctor =>
      doctor.department?.trim().toLowerCase() === department.name.trim().toLowerCase()
    );
  }

  onDepartmentChange(): void {
    const selectedDoctor = this.doctors.find(doctor =>
      String(doctor.id) === String(this.appointmentForm.get('doctorId')?.value)
    );
    if (selectedDoctor && !this.departmentDoctors.some(doctor => doctor.id === selectedDoctor.id)) {
      this.appointmentForm.patchValue({ doctorId: '' });
    }
  }

  onPatientChange(): void {
    const patientId = this.appointmentForm.get('patientId')?.value;
    const patient = this.patients.find(item => String(item.id) === String(patientId));
    if (!patient) return;

    this.appointmentForm.patchValue({
      age: patient.age ?? null,
      gender: patient.gender ?? ''
    });
  }

  loadAppointment(id: number): void {
    this.appointmentService.getAppointmentById(id).subscribe({
      next: (appointment: any) => {
        this.appointmentForm.patchValue({
          appointmentId: appointment.appointmentId,
          patientId: appointment.patient?.id ?? appointment.patientId ?? '',
          patientPhone: appointment.patient?.phone ?? '',
          age: appointment.age ?? null,
          gender: appointment.gender ?? '',
          doctorId: appointment.doctor?.id ?? appointment.doctorId ?? '',
          departmentId:
            appointment.department?.id ??
            appointment.departmentId ??
            '',
          appointmentDate: appointment.appointmentDate ?? '',
          appointmentTime: appointment.appointmentTime ?? '',
          reason: appointment.reason ?? '',
          status: String(appointment.status ?? 'PENDING').toUpperCase(),
          notes: appointment.notes ?? ''
        });
      },
      error: error => {
        console.error('Appointment loading failed:', error);
      }
    });
  }

  saveAppointment(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    const formValue = this.appointmentForm.getRawValue();

    const payload = {
      appointmentId: formValue.appointmentId,
      patientId: Number(formValue.patientId),
      doctorId: Number(formValue.doctorId),
      departmentId: Number(formValue.departmentId),
      appointmentDate: formValue.appointmentDate,
      appointmentTime: formValue.appointmentTime,
      reason: formValue.reason,
      age: formValue.age === '' || formValue.age == null ? null : Number(formValue.age),
      gender: formValue.gender || null,
      status: String(formValue.status).toUpperCase(),
      notes: formValue.notes || ''
    };

    if (
      !payload.patientId ||
      !payload.doctorId ||
      !payload.departmentId ||
      !payload.appointmentDate
    ) {
      console.error('Patient, Doctor, Department and Date are required.');
      return;
    }

    if (this.isEditMode) {
      this.appointmentService
        .updateAppointment(this.appointmentId, payload as any)
        .subscribe({
          next: () => {
            this.router.navigate(['/admin/appointments']);
          },
          error: error => {
            console.error('Appointment update failed:', error);
          }
        });
    } else {
      this.appointmentService
        .addAppointment(payload as any)
        .subscribe({
          next: () => {
            this.router.navigate(['/admin/appointments']);
          },
          error: error => {
            console.error('Appointment save failed:', error);
          }
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/appointments']);
  }

  isInvalid(field: string): boolean {
    const control = this.appointmentForm.get(field);

    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty)
    );
  }
}
