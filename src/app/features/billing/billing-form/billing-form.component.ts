import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BillingService } from '../../../core/services/billing.service';
import { BillablePrescriptionTest, Billing, BillingItem, BillingServiceCategory } from '../../../models/billing';
import { PatientService } from '../../../core/services/patient.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { DepartmentService } from '../../../core/services/department.service';
import { Patient } from '../../../models/patient';
import { Doctor } from '../../../models/doctor';
import { Department } from '../../../models/department';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-billing-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './billing-form.component.html',
  styleUrl: './billing-form.component.css'
})
export class BillingFormComponent implements OnInit {
  isEdit = false;
  billId = 0;
  isSaving = false;
  errorMessage = '';
  patients: Patient[] = [];
  patientPhone = '';
  doctors: Doctor[] = [];
  departments: Department[] = [];
  prescribedTests: BillablePrescriptionTest[] = [];
  readonly isReceptionist: boolean;
  private readonly allCategories: Array<{ value: BillingServiceCategory; label: string }> = [
    { value: 'LABORATORY_TEST', label: 'Laboratory Test' },
    { value: 'DOCTOR_VISIT', label: 'Doctor Visit' },
    { value: 'ADMISSION', label: 'Admission' },
    { value: 'BED_CABIN', label: 'Bed / Cabin Charge' },
    { value: 'PHARMACY', label: 'Pharmacy' },
    { value: 'OTHER', label: 'Other Service' }
  ];

  get categories(): Array<{ value: BillingServiceCategory; label: string }> {
    return this.isReceptionist
      ? this.allCategories.filter(category => category.value === 'DOCTOR_VISIT')
      : this.allCategories.filter(category => category.value !== 'DOCTOR_VISIT');
  }

  bill: Billing = this.newBill();

  constructor(
    private readonly billingService: BillingService,
    private readonly patientService: PatientService,
    private readonly doctorService: DoctorService,
    private readonly departmentService: DepartmentService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService
  ) {
    this.isReceptionist = authService.hasRole('RECEPTIONIST');
  }

  ngOnInit(): void {
    this.patientService.getPatients().subscribe({ next: items => {
      this.patients = items ?? [];
      if (this.bill.patientId) this.onPatientChange();
    } });
    this.doctorService.getDoctors().subscribe({ next: items => this.doctors = items ?? [] });
    this.departmentService.getAll().subscribe({ next: items => this.departments = items ?? [] });
    if (!this.isReceptionist) {
      this.billingService.getUnbilledPrescriptionTests().subscribe({ next: tests => this.prescribedTests = tests ?? [] });
    }

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id > 0) {
      this.isEdit = true;
      this.billId = id;
      this.billingService.getBillById(id).subscribe({
        next: existing => {
          this.bill = { ...this.newBill(), ...existing, items: (existing.items ?? []).map(item => ({ ...item })) };
          this.onPatientChange();
          if (!this.bill.items?.length) {
            this.bill.items = [{ serviceCategory: 'OTHER', description: existing.serviceName || '', quantity: 1, unitPrice: Number(existing.amount ?? 0) }];
          }
          this.calculateTotal();
        },
        error: () => this.errorMessage = 'Could not load the invoice.'
      });
      return;
    }

    this.bill.invoiceDate = new Date().toISOString().slice(0, 10);
    this.bill.invoiceId = `INV-${Date.now().toString().slice(-8)}`;
    const params = this.route.snapshot.queryParamMap;
    const appointmentId = Number(params.get('appointmentId'));
    if (appointmentId > 0) {
      const appointmentCode = params.get('appointmentCode') || String(appointmentId);
      this.bill = {
        ...this.bill,
        invoiceId: `INV-${appointmentCode}`,
        appointmentId,
        patientId: params.get('patientId') || '',
        patientName: params.get('patientName') || '',
        doctor: params.get('doctor') || '',
        department: params.get('department') || '',
        serviceName: params.get('serviceName') || `Doctor visit - ${appointmentCode}`,
        items: [{ serviceCategory: 'DOCTOR_VISIT', description: params.get('serviceName') || `Doctor visit - ${appointmentCode}`, quantity: 1, unitPrice: 0 }]
      };
      this.onPatientChange();
    }
    this.calculateTotal();
  }

  private newBill(): Billing {
    return {
      invoiceId: '', patientName: '', patientId: '', doctor: '', department: '', serviceName: '',
      amount: 0, discount: 0, tax: 0, totalAmount: 0, paidAmount: 0,
      paymentStatus: 'Pending', invoiceDate: '', items: []
    };
  }

  addLine(): void {
    this.bill.items ??= [];
    this.bill.items.push({ serviceCategory: this.isReceptionist ? 'DOCTOR_VISIT' : 'OTHER', description: '', quantity: 1, unitPrice: 0 });
  }

  removeLine(index: number): void {
    this.bill.items?.splice(index, 1);
    this.calculateTotal();
  }

  addPrescribedTest(test: BillablePrescriptionTest): void {
    if (this.isReceptionist) return;
    this.bill.items ??= [];
    if (this.bill.items.some(item => item.prescriptionTestId === test.prescriptionTestId)) return;
    if (this.bill.patientId && this.bill.patientId !== test.patientId) {
      this.errorMessage = 'One invoice can include prescribed tests for one patient. Create a separate invoice for another patient.';
      return;
    }
    this.errorMessage = '';
    if (!this.bill.patientId) {
      this.bill.patientId = test.patientId;
      this.bill.patientName = test.patientName;
    }
    if (!this.bill.doctor) this.bill.doctor = test.doctorName;
    if (!this.bill.department) this.bill.department = test.departmentName || '';
    this.bill.items.push({
      serviceCategory: 'LABORATORY_TEST',
      description: `${test.testName} (${test.testCode})`,
      quantity: 1,
      unitPrice: Number(test.price),
      prescriptionTestId: test.prescriptionTestId
    });
    this.calculateTotal();
  }

  hasTest(testId: number): boolean {
    return !!this.bill.items?.some(item => item.prescriptionTestId === testId);
  }

  onPatientChange(): void {
    const patient = this.patients.find(item => item.patientId === this.bill.patientId);
    if (patient) {
      this.bill.patientName = patient.name;
      this.patientPhone = patient.phone ?? '';
      if (!this.bill.doctor && patient.doctor) this.bill.doctor = patient.doctor;
      if (!this.bill.department && patient.department) this.bill.department = patient.department;
    } else {
      this.bill.patientName = '';
      this.patientPhone = '';
    }
  }

  get dueAmount(): number {
    return Math.max(0, Number(this.bill.totalAmount || 0) - Number(this.bill.paidAmount || 0));
  }

  updatePaymentStatus(): void {
    const total = Number(this.bill.totalAmount || 0);
    const paid = Number(this.bill.paidAmount || 0);
    this.bill.paymentStatus = total > 0 && paid >= total ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Pending';
  }

  get hasPrescribedTests(): boolean {
    return !!this.bill.items?.some(item => item.prescriptionTestId != null);
  }

  get subtotal(): number {
    return this.money((this.bill.items ?? []).reduce((sum, item) => sum + this.money(Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0));
  }

  calculateTotal(): void {
    this.bill.amount = this.subtotal;
    this.bill.totalAmount = this.money(Math.max(0, this.subtotal - Number(this.bill.discount || 0) + Number(this.bill.tax || 0)));
    this.updatePaymentStatus();
  }

  private money(amount: number): number {
    return Math.round((amount + Number.EPSILON) * 100) / 100;
  }

  saveBill(): void {
    this.errorMessage = '';
    if (!this.bill.patientId || !this.bill.patientName || !this.bill.invoiceId || !this.bill.items?.length) {
      this.errorMessage = 'Select a patient, invoice number and at least one service line.';
      return;
    }
    if (this.bill.items.some(item => !item.description.trim() || Number(item.quantity) <= 0 || Number(item.unitPrice) < 0)) {
      this.errorMessage = 'Complete each service description, quantity and price before saving.';
      return;
    }
    const hasDoctorVisit = this.bill.items.some(item => item.serviceCategory === 'DOCTOR_VISIT');
    if (this.isReceptionist !== hasDoctorVisit
      || (hasDoctorVisit && this.bill.items.some(item => item.serviceCategory !== 'DOCTOR_VISIT'))) {
      this.errorMessage = this.isReceptionist
        ? 'Reception can create Doctor Visit invoices only.'
        : 'Doctor Visit invoices can only be created by Reception Staff.';
      return;
    }
    if (Number(this.bill.discount || 0) > this.subtotal) {
      this.errorMessage = 'Discount cannot exceed the service subtotal.';
      return;
    }
    this.calculateTotal();
    if (Number(this.bill.paidAmount || 0) < 0 || Number(this.bill.paidAmount || 0) > this.bill.totalAmount) {
      this.errorMessage = 'Paid amount must be between zero and the invoice total.';
      return;
    }
    const selectedPatient = this.patients.find(patient => patient.patientId === this.bill.patientId);
    if (!selectedPatient?.id) {
      this.errorMessage = 'The selected patient could not be matched to a patient record. Please select the patient again.';
      return;
    }
    const payload = {
      invoiceId: this.bill.invoiceId,
      patient: { id: selectedPatient.id },
      doctor: this.doctors.find(item => item.name === this.bill.doctor)?.id
        ? { id: this.doctors.find(item => item.name === this.bill.doctor)!.id! }
        : null,
      department: this.departments.find(item => item.departmentName === this.bill.department)?.id
        ? { id: this.departments.find(item => item.departmentName === this.bill.department)!.id }
        : null,
      appointment: this.bill.appointmentId ? { id: this.bill.appointmentId } : null,
      serviceName: this.bill.serviceName,
      amount: this.bill.amount,
      discount: this.bill.discount,
      tax: this.bill.tax,
      paidAmount: this.bill.paidAmount,
      paymentStatus: this.bill.paymentStatus,
      invoiceDate: this.bill.invoiceDate,
      items: this.bill.items.map(item => ({
        ...item,
        lineTotal: Number(item.quantity) * Number(item.unitPrice),
        prescriptionTest: item.prescriptionTestId ? { id: item.prescriptionTestId } : null
      }))
    } as unknown as Partial<Billing>;
    this.isSaving = true;
    const request = this.isEdit
      ? this.billingService.updateBill(this.billId, payload)
      : this.billingService.addBill(payload);
    request.subscribe({
      next: () => this.router.navigate([this.billingListPath]),
      error: error => {
        this.errorMessage = error?.error?.message || 'Could not save the invoice.';
        this.isSaving = false;
      }
    });
  }

  get billingListPath(): string {
    if (this.authService.hasRole('RECEPTIONIST')) return '/reception/billing';
    if (this.authService.hasRole('ACCOUNTS_STAFF')) return '/accounts/billing';
    return '/admin/billing';
  }
}
