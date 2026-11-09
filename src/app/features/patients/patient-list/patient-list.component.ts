
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PatientService } from '../../../core/services/patient.service';
import { DepartmentService } from '../../../core/services/department.service';
import { AuthService } from '../../../core/services/auth.service';

import { Department } from '../../../models/department';
import { Patient } from '../../../models/patient';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.css'
})
export class PatientListComponent implements OnInit {

  patients: Patient[] = [];
  paginatedPatients: Patient[] = [];
  departments: Department[] = [];

  searchText = '';
  selectedDepartment = '';

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  isLoading = false;

  constructor(
    private patientService: PatientService,
    private departmentService: DepartmentService,
    private authService: AuthService
  ) {}

  // =========================
  // ROLE PERMISSIONS
  // =========================

  get isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  get isReceptionist(): boolean {
    return this.authService.hasRole('RECEPTIONIST');
  }

  get isDoctor(): boolean {
    return this.authService.hasRole('DOCTOR');
  }

  get isNurse(): boolean {
    return this.authService.hasRole('NURSE');
  }

  get canAddPatient(): boolean {
    return this.isAdmin || this.isReceptionist;
  }

  get canEditPatient(): boolean {
    return this.isAdmin || this.isReceptionist;
  }

  get canDeletePatient(): boolean {
    return this.isAdmin;
  }

  // =========================
  // INITIALIZE
  // =========================

  ngOnInit(): void {
    this.loadPatients();

    this.departmentService.getAll().subscribe({
      next: departments => this.departments = departments,
      error: error => console.error('Failed to load departments:', error)
    });
  }

  // =========================
  // PATIENT COUNTS
  // =========================

  get activePatients(): number {
    return this.patients.filter(
      patient => patient.status?.toLowerCase() === 'active'
    ).length;
  }

  get pendingPatients(): number {
    return this.patients.filter(
      patient => patient.status?.toLowerCase() === 'pending'
    ).length;
  }

  get newPatientsThisMonth(): number {
    const now = new Date();

    return this.patients.filter(patient => {
      if (!patient.createdAt) return false;

      const created = new Date(patient.createdAt);

      return (
        created.getFullYear() === now.getFullYear() &&
        created.getMonth() === now.getMonth()
      );
    }).length;
  }

  // =========================
  // LOAD PATIENTS
  // =========================

  loadPatients(): void {
    this.isLoading = true;

    this.patientService.getPatients().subscribe({
      next: (patients: Patient[]) => {
        this.patients = patients;
        this.currentPage = 1;
        this.filterPatients();
        this.isLoading = false;
      },
      error: error => {
        console.error('Failed to load patients:', error);
        alert('Patients could not be loaded. Check backend and login.');
        this.isLoading = false;
      }
    });
  }

  // =========================
  // SEARCH & FILTER
  // =========================

  filterPatients(): void {
    this.currentPage = 1;
    this.updatePagination(this.getFilteredPatients());
  }

  getFilteredPatients(): Patient[] {
    const search = this.searchText.toLowerCase().trim();

    return this.patients.filter(patient => {

      const matchesSearch =
        (patient.name || '').toLowerCase().includes(search) ||
        (patient.phone || '').includes(search) ||
        (patient.patientId || '').toLowerCase().includes(search);

      const matchesDepartment =
        !this.selectedDepartment ||
        patient.department === this.selectedDepartment;

      return matchesSearch && matchesDepartment;
    });
  }

  // =========================
  // PAGINATION
  // =========================

  updatePagination(
    filteredPatients: Patient[] = this.getFilteredPatients()
  ): void {

    this.totalPages = Math.max(
      1,
      Math.ceil(filteredPatients.length / this.pageSize)
    );

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;

    this.paginatedPatients = filteredPatients.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.updatePagination();
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  get pages(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1
    );
  }

  get startItem(): number {
    const total = this.getFilteredPatients().length;

    return total === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.getFilteredPatients().length
    );
  }

  // =========================
  // DELETE PATIENT
  // =========================

  deletePatient(id: number | undefined): void {

    if (!this.canDeletePatient) {
      alert('You do not have permission to delete patients.');
      return;
    }

    if (id == null) {
      alert('Patient ID is missing.');
      return;
    }

    if (!confirm('Are you sure you want to delete this patient?')) {
      return;
    }

    this.patientService.deletePatient(id).subscribe({
      next: () => {
        alert('Patient deleted successfully!');
        this.loadPatients();
      },
      error: error => {
        console.error('Failed to delete patient:', error);
        alert('Patient could not be deleted. Check backend permissions.');
      }
    });
  }
}
