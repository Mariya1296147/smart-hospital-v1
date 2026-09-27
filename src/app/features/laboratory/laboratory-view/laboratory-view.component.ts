import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  ActivatedRoute
} from '@angular/router';

import { LaboratoryService } from '../../../core/services/laboratory.service';
import { Laboratory } from '../../../models/laboratory';


@Component({
  selector: 'app-laboratory-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './laboratory-view.component.html',
  styleUrl: './laboratory-view.component.css'
})
export class LaboratoryViewComponent implements OnInit {

  laboratory!: Laboratory;

  constructor(
    private laboratoryService: LaboratoryService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    const data =
      this.laboratoryService.getLaboratoryById(id);

    if (data) {
      this.laboratory = data;
    }
  }
}