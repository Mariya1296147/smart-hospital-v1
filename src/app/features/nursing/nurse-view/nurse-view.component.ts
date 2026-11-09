import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  ActivatedRoute
} from '@angular/router';
import { Nurse } from '../../../models/nursing';
import { NurseService } from '../../../core/services/nursing.service';



@Component({
  selector: 'app-nurse-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './nurse-view.component.html',
  styleUrl: './nurse-view.component.css'
})
export class NurseViewComponent implements OnInit {

  nurse!: Nurse;

  constructor(
    private nurseService: NurseService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.nurseService.getNurseById(id).subscribe({
      next: data => this.nurse = data,
      error: error => console.error('নার্সের তথ্য পাওয়া যায়নি', error)
    });
  }
}
