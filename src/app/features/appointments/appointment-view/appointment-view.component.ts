import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { Appointment, AppointmentService } from '../../../core/services/appointment.service';

@Component({
  selector: 'app-appointment-view',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './appointment-view.component.html',
  styleUrl: './appointment-view.component.css'
})
export class AppointmentViewComponent
  implements OnInit {

  appointment?: Appointment;


  constructor(
    private route: ActivatedRoute,
    private appointmentService: AppointmentService,
    private router: Router
  ) {}


  ngOnInit(): void {

    const id =
      Number(
        this.route.snapshot.paramMap.get('id')
      );


    this.appointment =
      this.appointmentService
        .getAppointmentById(id);


    if (!this.appointment) {

      this.router.navigate([
        '/admin/appointments'
      ]);

    }

  }


  getStatusClass(status: string): string {

    switch (status) {

      case 'Scheduled':
        return 'status-scheduled';

      case 'Pending':
        return 'status-pending';

      case 'Completed':
        return 'status-completed';

      case 'Cancelled':
        return 'status-cancelled';

      default:
        return '';

    }

  }

}