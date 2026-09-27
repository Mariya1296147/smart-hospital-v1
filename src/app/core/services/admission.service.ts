import { Injectable } from '@angular/core';
import { Admission } from '../../models/admission';


@Injectable({
  providedIn: 'root'
})
export class AdmissionService {

  private admissions: Admission[] = [
    {
      id: 1,
      admissionId: 'ADM-1001',
      patientName: 'Mariya Rahman',
      department: 'Cardiology',
      doctor: 'Dr. Ahmed Khan',
      admissionDate: '2026-09-15',
      ward: 'General Ward',
      bed: 'G-101',
      reason: 'Chest pain',
      status: 'Admitted'
    },
    {
      id: 2,
      admissionId: 'ADM-1002',
      patientName: 'Sarah Ahmed',
      department: 'Neurology',
      doctor: 'Dr. Nusrat Jahan',
      admissionDate: '2026-09-16',
      ward: 'Private Ward',
      bed: 'P-205',
      reason: 'Severe headache',
      status: 'Admitted'
    }
  ];

  getAdmissions(): Admission[] {
    return this.admissions;
  }

  getAdmissionById(id: number): Admission | undefined {
    return this.admissions.find(a => a.id === id);
  }

  addAdmission(admission: Admission): void {
    const newId =
      this.admissions.length > 0
        ? Math.max(...this.admissions.map(a => a.id)) + 1
        : 1;

    admission.id = newId;

    this.admissions.push(admission);
  }

  updateAdmission(admission: Admission): void {
    const index = this.admissions.findIndex(
      a => a.id === admission.id
    );

    if (index !== -1) {
      this.admissions[index] = admission;
    }
  }

  deleteAdmission(id: number): void {
    this.admissions = this.admissions.filter(
      a => a.id !== id
    );
  }
}