import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Nurse } from '../../../models/nursing';
import { NurseService } from '../../../core/services/nursing.service';



@Component({
  selector: 'app-nurse-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './nurse-list.component.html',
  styleUrl: './nurse-list.component.css'
})
export class NurseListComponent implements OnInit {

  nurses: Nurse[] = [];

  constructor(
    private nurseService: NurseService
  ) {}

  ngOnInit(): void {
    this.loadNurses();
  }

  loadNurses(): void {
    this.nurses = this.nurseService.getNurses();
  }

  deleteNurse(id: number): void {

    if (confirm('Are you sure you want to delete this nurse?')) {

      this.nurseService.deleteNurse(id);

      this.loadNurses();

      alert('Nurse deleted successfully!');
    }
  }
}