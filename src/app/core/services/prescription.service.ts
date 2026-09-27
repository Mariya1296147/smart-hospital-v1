import { Injectable } from '@angular/core';
import { Prescription } from '../../models/prescription';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {

  private prescriptions: Prescription[] = [];

  constructor() {}

  getPrescriptions(): Prescription[] {
    return this.prescriptions;
  }

  addPrescription(prescription: Prescription): void {
    this.prescriptions.push(prescription);
  }

  getPrescriptionById(id: number): Prescription | undefined {
    return this.prescriptions.find(p => p.id === id);
  }

  deletePrescription(id: number): void {
    this.prescriptions = this.prescriptions.filter(p => p.id !== id);
  }
}