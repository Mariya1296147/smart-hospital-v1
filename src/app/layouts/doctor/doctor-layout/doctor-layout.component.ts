
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DoctorSidebarComponent } from '../doctor-sidebar/doctor-sidebar.component';

@Component({
  selector: 'app-doctor-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    DoctorSidebarComponent
  ],
  templateUrl: './doctor-layout.component.html',
  styleUrl: './doctor-layout.component.css'
})
export class DoctorLayoutComponent {

}
