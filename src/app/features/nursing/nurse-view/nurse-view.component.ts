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

    const data =
      this.nurseService.getNurseById(id);

    if (data) {
      this.nurse = data;
    }
  }
}