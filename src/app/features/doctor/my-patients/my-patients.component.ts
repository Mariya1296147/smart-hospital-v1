
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DoctorPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  department: string;
  status: string;
}

@Component({
  selector: 'app-my-patients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './my-patients.component.html',
  styleUrl: './my-patients.component.css'
})
export class MyPatientsComponent {

  searchText = '';
  statusFilter = 'All';

  // Only Dr. Amina Rahman's patients
  patients: DoctorPatient[] = [
    {
      id: 'P-1001',
      name: 'Mariya Rahman',
      age: 28,
      gender: 'Female',
      bloodGroup: 'A+',
      phone: '01711111111',
      department: 'Cardiology',
      status: 'Active'
    },
    {
      id: 'P-1002',
      name: 'Sarah Ahmed',
      age: 35,
      gender: 'Female',
      bloodGroup: 'B+',
      phone: '01722222222',
      department: 'Cardiology',
      status: 'Admitted'
    },
    {
      id: 'P-1003',
      name: 'Rahim Uddin',
      age: 42,
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '01733333333',
      department: 'Cardiology',
      status: 'Active'
    },
    {
      id: 'P-1004',
      name: 'Nusrat Jahan',
      age: 31,
      gender: 'Female',
      bloodGroup: 'AB+',
      phone: '01744444444',
      department: 'Cardiology',
      status: 'Discharged'
    }
  ];

  get filteredPatients(): DoctorPatient[] {
    const search = this.searchText.trim().toLowerCase();

    return this.patients.filter(patient => {

      const matchesSearch =
        !search ||
        patient.name.toLowerCase().includes(search) ||
        patient.id.toLowerCase().includes(search) ||
        patient.phone.includes(search);

      const matchesStatus =
        this.statusFilter === 'All' ||
        patient.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  get activePatients(): number {
    return this.patients.filter(
      patient => patient.status === 'Active'
    ).length;
  }

  get admittedPatients(): number {
    return this.patients.filter(
      patient => patient.status === 'Admitted'
    ).length;
  }

  getStatusClass(status: string): string {

    switch (status) {

      case 'Active':
        return 'status-active';

      case 'Admitted':
        return 'status-admitted';

      case 'Discharged':
        return 'status-discharged';

      default:
        return '';
    }
  }

  viewPatient(patient: DoctorPatient): void {
    alert(
      `Patient: ${patient.name}\n` +
      `ID: ${patient.id}\n` +
      `Age: ${patient.age}\n` +
      `Department: ${patient.department}`
    );
  }

}
