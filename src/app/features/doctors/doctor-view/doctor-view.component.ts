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

  // ================================
  // DOCTOR DATA
  // ================================

  doctor: Doctor | undefined;


  // ================================
  // CONSTRUCTOR
  // ================================

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService
  ) {}


  // ================================
  // LOAD DOCTOR
  // ================================

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!id) {
      this.router.navigate([
        '/admin/doctors'
      ]);
      return;
    }

    this.doctor =
      this.doctorService.getDoctorById(id);


    // Doctor না পাওয়া গেলে
    if (!this.doctor) {

      alert('Doctor not found.');

      this.router.navigate([
        '/admin/doctors'
      ]);

    }

  }


  // ================================
  // EDIT DOCTOR
  // ================================

  editDoctor(): void {

    if (!this.doctor) {
      return;
    }

    this.router.navigate([
      '/admin/doctors/edit',
      this.doctor.id
    ]);

  }

}