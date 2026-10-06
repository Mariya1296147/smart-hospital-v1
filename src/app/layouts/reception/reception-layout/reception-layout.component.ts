
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReceptionSidebarComponent } from '../reception-sidebar/reception-sidebar.component';

@Component({
  selector: 'app-reception-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    ReceptionSidebarComponent
  ],
  templateUrl: './reception-layout.component.html',
  styleUrl: './reception-layout.component.css'
})
export class ReceptionLayoutComponent {

  sidebarOpen = false;

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
