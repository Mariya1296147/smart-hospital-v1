import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { DischargeService } from '../../../core/services/discharge.service';
import { Discharge } from '../../../models/discharge';

@Component({
  selector: 'app-discharge-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './discharge-view.component.html',
  styleUrl: './discharge-view.component.css'
})
export class DischargeViewComponent implements OnInit {

  discharge: Discharge | undefined;

  constructor(
    private route: ActivatedRoute,
    private dischargeService: DischargeService
  ) {}

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.discharge =
      this.dischargeService.getDischargeById(id);
  }
}