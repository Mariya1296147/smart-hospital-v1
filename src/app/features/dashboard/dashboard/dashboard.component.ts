import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  stats = [
    {
      title: 'Total Patients',
      value: 1248,
      icon: 'bi-people'
    },
    {
      title: 'Total Doctors',
      value: 52,
      icon: 'bi-person-badge'
    },
    {
      title: "Today's Appointments",
      value: 86,
      icon: 'bi-calendar-check'
    },
    {
      title: 'Admitted Patients',
      value: 34,
      icon: 'bi-hospital'
    }
  ];

}