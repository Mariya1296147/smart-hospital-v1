
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { Prescription } from '../../../models/prescription';
import { TestCatalogService } from '../../../core/services/test-catalog.service';
import { TestCatalogItem } from '../../../models/prescription';

@Component({
  selector: 'app-prescription-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './prescription-edit.component.html'
})
export class PrescriptionEditComponent implements OnInit {

  prescriptionForm!: FormGroup;
  prescriptionId!: number;

  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  availableTests: TestCatalogItem[] = [];
  selectedTestIds = new Set<number>();

  constructor(
    private fb: FormBuilder,
    private prescriptionService: PrescriptionService,
    private route: ActivatedRoute,
    private router: Router,
    private testCatalogService: TestCatalogService
  ) { }

  ngOnInit(): void {
    this.prescriptionId = Number(this.route.snapshot.paramMap.get('id'));

    this.prescriptionForm = this.fb.group({
      patientId: [null, Validators.required],
      doctorId: [null, Validators.required],
      departmentId: [null],
      consultationId: [null],
      diagnosis: ['', Validators.required],
      advice: [''],
      medicines: this.fb.array([])
    });

    this.loadPrescription();
    this.testCatalogService.getTests().subscribe({ next: tests => this.availableTests = tests ?? [], error: () => this.errorMessage = 'Failed to load test catalog.' });
  }

  get medicines(): FormArray {
    return this.prescriptionForm.get('medicines') as FormArray;
  }

  createMedicine(medicine?: any): FormGroup {
    return this.fb.group({
      id: [medicine?.id ?? null],
      medicineName: [medicine?.medicineName ?? '', Validators.required],
      dosage: [medicine?.dosage ?? '', Validators.required],
      frequency: [medicine?.frequency ?? '', Validators.required],
      duration: [medicine?.duration ?? '', Validators.required],
      instruction: [medicine?.instruction ?? '']
    });
  }

  addMedicine(): void {
    this.medicines.push(this.createMedicine());
  }

  removeMedicine(index: number): void {
    if (this.medicines.length > 1) {
      this.medicines.removeAt(index);
    }
  }

  loadPrescription(): void {
    this.isLoading = true;

    this.prescriptionService.getPrescriptionById(this.prescriptionId).subscribe({
      next: (prescription: Prescription) => {
        this.prescriptionForm.patchValue({
          patientId: prescription.patientId,
          doctorId: prescription.doctorId,
          departmentId: prescription.departmentId,
          consultationId: prescription.consultationId ?? null,
          diagnosis: prescription.diagnosis,
          advice: prescription.advice
        });

        this.selectedTestIds = new Set((prescription.tests ?? []).map(test => test.catalogTestId));

        this.medicines.clear();

        if (prescription.medicines?.length) {
          prescription.medicines.forEach(medicine => {
            this.medicines.push(this.createMedicine(medicine));
          });
        } else {
          this.addMedicine();
        }

        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load prescription.';
        this.isLoading = false;
      }
    });
  }

  updatePrescription(): void {
    if (this.prescriptionForm.invalid) {
      this.prescriptionForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const prescriptionData = {
      ...this.prescriptionForm.getRawValue(),
      tests: [...this.selectedTestIds].map(catalogTestId => ({ catalogTestId }))
    };

    this.prescriptionService.updatePrescription(
      this.prescriptionId,
      prescriptionData

    ).subscribe({
      next: () => {
        this.successMessage = 'Prescription updated successfully.';
        this.isSaving = false;

        setTimeout(() => {
          this.router.navigate(['/admin/prescriptions']);
        }, 1000);
      },
      error: () => {
        this.errorMessage = 'Failed to update prescription.';
        this.isSaving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/prescriptions']);
  }

  toggleTest(test: TestCatalogItem, checked: boolean): void {
    if (test.id == null) return;
    if (checked) this.selectedTestIds.add(test.id);
    else this.selectedTestIds.delete(test.id);
  }

  isTestSelected(id?: number): boolean { return id != null && this.selectedTestIds.has(id); }
}
