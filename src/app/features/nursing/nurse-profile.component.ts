import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NurseService } from '../../core/services/nursing.service';
import { Nurse } from '../../models/nursing';

@Component({ selector: 'app-nurse-profile', standalone: true, imports: [CommonModule], templateUrl: './nurse-profile.component.html' })
export class NurseProfileComponent implements OnInit {
  profile: Nurse | null = null;
  loading = true;
  error = '';
  constructor(private readonly nurses: NurseService) {}
  ngOnInit(): void {
    this.nurses.getMyProfile().subscribe({
      next: value => { this.profile = value; this.loading = false; },
      error: error => { this.error = error?.error?.message || 'Your nurse profile has not been linked yet. Ask an administrator to link your account and ward.'; this.loading = false; }
    });
  }
}
