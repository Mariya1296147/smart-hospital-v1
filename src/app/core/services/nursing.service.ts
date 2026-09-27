import { Injectable } from '@angular/core';
import { Nurse } from '../../models/nursing';


@Injectable({
  providedIn: 'root'
})
export class NurseService {

  private nurses: Nurse[] = [
    {
      id: 1,
      nurseId: 'N-1001',
      name: 'Nusrat Jahan',
      gender: 'Female',
      phone: '01711111111',
      email: 'nusrat@hospital.com',
      department: 'Cardiology',
      ward: 'General Ward',
      shift: 'Morning',
      qualification: 'BSc in Nursing',
      joiningDate: '2024-01-15',
      status: 'Active'
    },
    {
      id: 2,
      nurseId: 'N-1002',
      name: 'Sadia Ahmed',
      gender: 'Female',
      phone: '01822222222',
      email: 'sadia@hospital.com',
      department: 'Neurology',
      ward: 'Private Ward',
      shift: 'Night',
      qualification: 'Diploma in Nursing',
      joiningDate: '2023-08-20',
      status: 'Active'
    }
  ];

  getNurses(): Nurse[] {
    return this.nurses;
  }

  getNurseById(id: number): Nurse | undefined {
    return this.nurses.find(n => n.id === id);
  }

  addNurse(nurse: Nurse): void {
    const newId =
      this.nurses.length > 0
        ? Math.max(...this.nurses.map(n => n.id)) + 1
        : 1;

    nurse.id = newId;

    this.nurses.push(nurse);
  }

  updateNurse(nurse: Nurse): void {
    const index = this.nurses.findIndex(
      n => n.id === nurse.id
    );

    if (index !== -1) {
      this.nurses[index] = nurse;
    }
  }

  deleteNurse(id: number): void {
    this.nurses = this.nurses.filter(
      n => n.id !== id
    );
  }
}