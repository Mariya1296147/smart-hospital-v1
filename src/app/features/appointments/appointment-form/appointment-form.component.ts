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


import { Appointment, AppointmentService } from '../../../core/services/appointment.service';

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
export class AppointmentFormComponent
  implements OnInit {

  appointmentForm!: FormGroup;

  isEditMode = false;

  appointmentId!: number;


  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}


  ngOnInit(): void {

    this.createForm();

    const id =
      this.route.snapshot.paramMap.get('id');


    if (id) {

      this.isEditMode = true;

      this.appointmentId = Number(id);

      this.loadAppointment(this.appointmentId);

    }

  }


  createForm(): void {

    this.appointmentForm =
      this.fb.group({

        appointmentId: [
          '',
          Validators.required
        ],

        patientName: [
          '',
          Validators.required
        ],

        patientPhone: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[0-9]{11}$/)
          ]
        ],

        doctorName: [
          '',
          Validators.required
        ],

        department: [
          '',
          Validators.required
        ],

        appointmentDate: [
          '',
          Validators.required
        ],

        appointmentTime: [
          '',
          Validators.required
        ],

        reason: [
          '',
          Validators.required
        ],

        status: [
          'Scheduled',
          Validators.required
        ],

        notes: [
          ''
        ]

      });

  }


  loadAppointment(id: number): void {

    const appointment =
      this.appointmentService
        .getAppointmentById(id);


    if (!appointment) {

      this.router.navigate([
        '/admin/appointments'
      ]);

      return;

    }


    this.appointmentForm.patchValue(
      appointment
    );

  }


  saveAppointment(): void {

    if (this.appointmentForm.invalid) {

      this.appointmentForm
        .markAllAsTouched();

      return;

    }


    const appointment: Appointment = {

      id: this.isEditMode
        ? this.appointmentId
        : 0,

      ...this.appointmentForm.value

    };


    if (this.isEditMode) {

      this.appointmentService
        .updateAppointment(appointment);

    } else {

      this.appointmentService
        .addAppointment(appointment);

    }


    this.router.navigate([
      '/admin/appointments'
    ]);

  }


  cancel(): void {

    this.router.navigate([
      '/admin/appointments'
    ]);

  }


  isInvalid(field: string): boolean {

    const control =
      this.appointmentForm.get(field);


    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty)
    );

  }

}