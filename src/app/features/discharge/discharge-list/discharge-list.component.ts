import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DischargeService } from '../../../core/services/discharge.service';
import { Discharge } from '../../../models/discharge';

@Component({
  selector: 'app-discharge-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './discharge-list.component.html',
  styleUrl: './discharge-list.component.css'
})
export class DischargeListComponent implements OnInit {

  discharges: Discharge[] = [];

  constructor(
    private dischargeService: DischargeService
  ) {}

  ngOnInit(): void {
    this.loadDischarges();
  }

  loadDischarges(): void {
    this.discharges = this.dischargeService.getDischarges();
  }

  get totalDischarges(): number {
    return this.discharges.length;
  }

  get dischargedCount(): number {
    return this.discharges.filter(
      discharge => discharge.status === 'Discharged'
    ).length;
  }

  get pendingCount(): number {
    return this.discharges.filter(
      discharge => discharge.status === 'Pending'
    ).length;
  }

  deleteDischarge(id: number): void {

    const confirmed = confirm(
      'Are you sure you want to delete this discharge record?'
    );

    if (confirmed) {
      this.dischargeService.deleteDischarge(id);
      this.loadDischarges();
    }
  }
}