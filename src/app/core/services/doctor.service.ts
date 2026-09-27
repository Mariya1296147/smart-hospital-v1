import { Injectable } from '@angular/core';

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  email: string;
  phone: string;
  department: string;

  qualification?: string;
  experience?: string;
  address?: string;

  status: 'Active' | 'Inactive';
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  private doctors: Doctor[] = [
    {
      id: 1,
      name: 'Dr. Ahmed Rahman',
      specialization: 'Cardiology',
      email: 'ahmed@medicare.com',
      phone: '01711111111',
      department: 'Cardiology',
      qualification: 'MBBS, FCPS',
      experience: '8 Years',
      address: 'Dhaka, Bangladesh',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Dr. Nusrat Jahan',
      specialization: 'Neurology',
      email: 'nusrat@medicare.com',
      phone: '01822222222',
      department: 'Neurology',
      qualification: 'MBBS, MD',
      experience: '6 Years',
      address: 'Chittagong, Bangladesh',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Dr. Karim Hasan',
      specialization: 'Orthopedics',
      email: 'karim@medicare.com',
      phone: '01933333333',
      department: 'Orthopedics',
      qualification: 'MBBS, MS',
      experience: '10 Years',
      address: 'Dhaka, Bangladesh',
      status: 'Inactive'
    }
  ];

  getDoctors(): Doctor[] {
    return this.doctors;
  }

  getDoctorById(id: number): Doctor | undefined {
    return this.doctors.find(
      doctor => doctor.id === id
    );
  }

  addDoctor(doctor: Omit<Doctor, 'id'>): void {
    const newDoctor: Doctor = {
      ...doctor,
      id: this.generateId()
    };

    this.doctors.push(newDoctor);
  }

  updateDoctor(
    id: number,
    updatedDoctor: Omit<Doctor, 'id'>
  ): void {

    const index = this.doctors.findIndex(
      doctor => doctor.id === id
    );

    if (index !== -1) {
      this.doctors[index] = {
        ...updatedDoctor,
        id: id
      };
    }
  }

  deleteDoctor(id: number): void {
    this.doctors = this.doctors.filter(
      doctor => doctor.id !== id
    );
  }

  private generateId(): number {
    if (this.doctors.length === 0) {
      return 1;
    }

    return Math.max(
      ...this.doctors.map(
        doctor => doctor.id
      )
    ) + 1;
  }
}