import { Injectable } from '@angular/core';
import { Discharge } from '../../models/discharge';


@Injectable({
  providedIn: 'root'
})
export class DischargeService {

  private discharges: Discharge[] = [

    {
      id: 1,
      dischargeId: 'DIS-1001',
      patientName: 'Mariya Rahman',
      patientId: 'P-1001',
      doctorName: 'Dr. Ahmed Rahman',
      department: 'Cardiology',
      admissionDate: '2026-09-10',
      dischargeDate: '2026-09-15',
      room: '101',
      bed: 'B-01',
      dischargeType: 'Normal',
      diagnosis: 'Mild cardiac condition',
      treatment: 'Medication and observation',
      prescription: 'Aspirin 75mg, Atorvastatin 20mg',
      instructions: 'Take medicines regularly and follow up after 7 days.',
      status: 'Discharged'
    },

    {
      id: 2,
      dischargeId: 'DIS-1002',
      patientName: 'Sarah Ahmed',
      patientId: 'P-1002',
      doctorName: 'Dr. Rahim Khan',
      department: 'Neurology',
      admissionDate: '2026-09-11',
      dischargeDate: '2026-09-16',
      room: '205',
      bed: 'B-03',
      dischargeType: 'Normal',
      diagnosis: 'Migraine',
      treatment: 'Medication and rest',
      prescription: 'Paracetamol 500mg',
      instructions: 'Avoid stress and maintain proper sleep.',
      status: 'Discharged'
    },

    {
      id: 3,
      dischargeId: 'DIS-1003',
      patientName: 'Karim Hasan',
      patientId: 'P-1003',
      doctorName: 'Dr. Nusrat Jahan',
      department: 'Pediatrics',
      admissionDate: '2026-09-12',
      dischargeDate: '2026-09-17',
      room: '302',
      bed: 'B-02',
      dischargeType: 'Normal',
      diagnosis: 'Viral infection',
      treatment: 'Medication and hydration',
      prescription: 'Paracetamol Syrup',
      instructions: 'Keep the patient hydrated and take medicines on time.',
      status: 'Discharged'
    },

    {
      id: 4,
      dischargeId: 'DIS-1004',
      patientName: 'Nusrat Akter',
      patientId: 'P-1004',
      doctorName: 'Dr. Tanvir Hasan',
      department: 'Orthopedics',
      admissionDate: '2026-09-13',
      dischargeDate: '2026-09-18',
      room: '410',
      bed: 'B-05',
      dischargeType: 'Normal',
      diagnosis: 'Joint inflammation',
      treatment: 'Physiotherapy and medication',
      prescription: 'Pain relief medication',
      instructions: 'Continue physiotherapy and avoid heavy work.',
      status: 'Discharged'
    },

    {
      id: 5,
      dischargeId: 'DIS-1005',
      patientName: 'Imran Hossain',
      patientId: 'P-1005',
      doctorName: 'Dr. Maria Akter',
      department: 'Dermatology',
      admissionDate: '2026-09-14',
      dischargeDate: '2026-09-19',
      room: '215',
      bed: 'B-04',
      dischargeType: 'Normal',
      diagnosis: 'Skin allergy',
      treatment: 'Medication and topical treatment',
      prescription: 'Antihistamine and topical cream',
      instructions: 'Avoid suspected allergens and continue medication.',
      status: 'Discharged'
    }

  ];

  getDischarges(): Discharge[] {
    return this.discharges;
  }

  getDischargeById(id: number): Discharge | undefined {
    return this.discharges.find(
      discharge => discharge.id === id
    );
  }

  addDischarge(discharge: Discharge): void {

    const newId = this.discharges.length > 0
      ? Math.max(...this.discharges.map(d => d.id)) + 1
      : 1;

    discharge.id = newId;

    this.discharges.push(discharge);
  }

  updateDischarge(updatedDischarge: Discharge): void {

    const index = this.discharges.findIndex(
      discharge => discharge.id === updatedDischarge.id
    );

    if (index !== -1) {
      this.discharges[index] = updatedDischarge;
    }
  }

  deleteDischarge(id: number): void {

    this.discharges = this.discharges.filter(
      discharge => discharge.id !== id
    );
  }
}