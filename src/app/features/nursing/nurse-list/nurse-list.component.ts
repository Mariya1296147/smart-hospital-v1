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
    this.nurseService.getNurses().subscribe({
      next: nurses => this.nurses = nurses,
      error: error => console.error('নার্সের তালিকা লোড করা যায়নি', error)
    });
  }

  deleteNurse(id: number): void {

    if (confirm('Are you sure you want to delete this nurse?')) {

      this.nurseService.deleteNurse(id).subscribe({
        next: () => { this.loadNurses(); alert('নার্সের রেকর্ড মুছে ফেলা হয়েছে।'); },
        error: error => console.error('নার্সের রেকর্ড মুছতে ব্যর্থ', error)
      });
    }
  }
}
