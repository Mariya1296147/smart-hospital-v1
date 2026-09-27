import { Injectable } from '@angular/core';
import { Laboratory } from '../../models/laboratory';
@Injectable({
  providedIn: 'root'
})
export class LaboratoryService {

  private laboratoryTests: Laboratory[] = [
    {
      id: 1,
      testId: 'LAB-1001',
      patientName: 'Mariya Rahman',
      testName: 'Complete Blood Count (CBC)',
      department: 'Hematology',
      doctor: 'Dr. Ahmed Khan',
      sampleDate: '2026-09-18',
      result: 'Normal',
      status: 'Completed'
    },
    {
      id: 2,
      testId: 'LAB-1002',
      patientName: 'Sarah Ahmed',
      testName: 'Blood Glucose',
      department: 'Biochemistry',
      doctor: 'Dr. Nusrat Jahan',
      sampleDate: '2026-09-19',
      result: '5.8 mmol/L',
      status: 'Completed'
    },
    {
      id: 3,
      testId: 'LAB-1003',
      patientName: 'Rahim Uddin',
      testName: 'Liver Function Test',
      department: 'Biochemistry',
      doctor: 'Dr. Ahmed Khan',
      sampleDate: '2026-09-20',
      result: 'Pending',
      status: 'Pending'
    }
  ];

  getLaboratoryTests(): Laboratory[] {
    return this.laboratoryTests;
  }

  getLaboratoryById(id: number): Laboratory | undefined {
    return this.laboratoryTests.find(
      test => test.id === id
    );
  }

  addLaboratory(test: Laboratory): void {

    const newId =
      this.laboratoryTests.length > 0
        ? Math.max(
            ...this.laboratoryTests.map(test => test.id)
          ) + 1
        : 1;

    test.id = newId;

    this.laboratoryTests.push(test);
  }

  updateLaboratory(test: Laboratory): void {

    const index =
      this.laboratoryTests.findIndex(
        item => item.id === test.id
      );

    if (index !== -1) {
      this.laboratoryTests[index] = test;
    }
  }

  deleteLaboratory(id: number): void {

    this.laboratoryTests =
      this.laboratoryTests.filter(
        test => test.id !== id
      );
  }
}