
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Doctor, DoctorService } from '../../../core/services/doctor.service';

@Component({
  selector: 'app-doctor-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './doctor-view.component.html',
  styleUrl: './doctor-view.component.css'
})
export class DoctorViewComponent implements OnInit {

  doctor: Doctor | undefined;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isFinite(id) || id <= 0) {
      alert('Invalid doctor ID.');
      this.router.navigate(['/admin/doctors']);
      return;
    }

    this.isLoading = true;

    this.doctorService.getDoctorById(id).subscribe({
      next: (data) => {
        this.doctor = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load doctor:', error);
        this.isLoading = false;

        alert('Doctor not found or unable to load doctor details.');

        this.router.navigate(['/admin/doctors']);
      }
    });
  }

  editDoctor(): void {
    if (this.doctor?.id == null) {
      return;
    }

    this.router.navigate([
      '/admin/doctors/edit',
      this.doctor.id
    ]);
  }
}
