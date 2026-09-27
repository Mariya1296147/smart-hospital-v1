import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.css'
})
export class PatientListComponent {

  // All filtered patients
  patients: any[] = [];

  // Patients shown on current page
  paginatedPatients: any[] = [];

  // Search
  searchText: string = '';

  // Department filter
  selectedDepartment: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;

  constructor(
    private patientService: PatientService
  ) {
    this.loadPatients();
  }

  // =========================================
  // LOAD PATIENTS
  // =========================================

  loadPatients(): void {
    this.filterPatients();
  }


  // =========================================
  // SEARCH & FILTER
  // =========================================

  filterPatients(): void {

    let filtered = this.patientService.getPatients();

    // Search by name, phone or patient ID
    if (this.searchText.trim()) {

      const search = this.searchText
        .toLowerCase()
        .trim();

      filtered = filtered.filter(patient =>
        (patient.name || '')
          .toLowerCase()
          .includes(search) ||

        (patient.phone || '')
          .includes(search) ||

        (patient.patientId || '')
          .toLowerCase()
          .includes(search)
      );
    }

    // Department filter
    if (this.selectedDepartment) {

      filtered = filtered.filter(
        patient =>
          patient.department === this.selectedDepartment
      );
    }

    // Save filtered patients
    this.patients = filtered;

    // Search/filter হলে প্রথম page-এ যাবে
    this.currentPage = 1;

    // Update pagination
    this.updatePagination();
  }


  // =========================================
  // UPDATE PAGINATION
  // =========================================

  updatePagination(): void {

    // Total pages
    this.totalPages = Math.ceil(
      this.patients.length / this.pageSize
    ) || 1;

    // Current page যেন বাইরে না যায়
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    // Starting index
    const startIndex =
      (this.currentPage - 1) * this.pageSize;

    // Ending index
    const endIndex =
      startIndex + this.pageSize;

    // Current page-এর patients
    this.paginatedPatients =
      this.patients.slice(
        startIndex,
        endIndex
      );
  }


  // =========================================
  // GO TO PAGE
  // =========================================

  goToPage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }

    this.currentPage = page;

    this.updatePagination();
  }


  // =========================================
  // PREVIOUS PAGE
  // =========================================

  previousPage(): void {

    if (this.currentPage > 1) {

      this.currentPage--;

      this.updatePagination();
    }
  }


  // =========================================
  // NEXT PAGE
  // =========================================

  nextPage(): void {

    if (this.currentPage < this.totalPages) {

      this.currentPage++;

      this.updatePagination();
    }
  }


  // =========================================
  // PAGE NUMBERS
  // =========================================

  get pages(): number[] {

    return Array.from(
      { length: this.totalPages },
      (_, i) => i + 1
    );
  }


  // =========================================
  // START ITEM
  // =========================================

  get startItem(): number {

    if (this.patients.length === 0) {
      return 0;
    }

    return (
      (this.currentPage - 1) *
      this.pageSize
    ) + 1;
  }


  // =========================================
  // END ITEM
  // =========================================

  get endItem(): number {

    return Math.min(
      this.currentPage * this.pageSize,
      this.patients.length
    );
  }


  // =========================================
  // DELETE PATIENT
  // =========================================

  deletePatient(id: number): void {

    const confirmDelete = confirm(
      'Are you sure you want to delete this patient?'
    );

    if (confirmDelete) {

      this.patientService.deletePatient(id);

      this.filterPatients();

      alert('Patient deleted successfully!');
    }
  }

}