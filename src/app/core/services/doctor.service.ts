
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
  image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  private doctors: Doctor[] = [
    {
      id: 1,
      name: 'Dr. Sarah Ahmed',
      specialization: 'Cardiology',
      email: 'sarah@medicare.com',
      phone: '01711111111',
      department: 'Cardiology',
      qualification: 'MBBS, FCPS',
      experience: '12 Years',
      address: 'Dhaka, Bangladesh',
      status: 'Active',
      image: 'assets/doctor 4.jpg'
    },
    {
      id: 2,
      name: 'Dr. Rahim Khan',
      specialization: 'Neurology',
      email: 'rahim@medicare.com',
      phone: '01822222222',
      department: 'Neurology',
      qualification: 'MBBS, MD',
      experience: '10 Years',
      address: 'Dhaka, Bangladesh',
      status: 'Active',
      image: 'assets/doctor11.jpg'
    },
    {
      id: 3,
      name: 'Dr. Nusrat Jahan',
      specialization: 'Pediatrics',
      email: 'nusrat@medicare.com',
      phone: '01933333333',
      department: 'Pediatrics',
      qualification: 'MBBS, DCH',
      experience: '8 Years',
      address: 'Dhaka, Bangladesh',
      status: 'Active',
      image: 'assets/doctor 9.jpeg'
    },
    {
      id: 4,
      name: 'Dr. Tanvir Hasan',
      specialization: 'Orthopedics',
      email: 'tanvir@medicare.com',
      phone: '01644444444',
      department: 'Orthopedics',
      qualification: 'MBBS, MS',
      experience: '11 Years',
      address: 'Dhaka, Bangladesh',
      status: 'Active',
      image: 'assets/doctorss.avif'
    },
    {
      id: 5,
      name: 'Dr. Maria Akter',
      specialization: 'Dermatology',
      email: 'maria@medicare.com',
      phone: '01555555555',
      department: 'Dermatology',
      qualification: 'MBBS, DDV',
      experience: '9 Years',
      address: 'Dhaka, Bangladesh',
      status: 'Active',
      image: 'assets/doctor10.avif'
    },
    {
      id: 6,
      name: 'Dr. Farhan Ahmed',
      specialization: 'General Medicine',
      email: 'farhan@medicare.com',
      phone: '01466666666',
      department: 'General Medicine',
      qualification: 'MBBS, FCPS',
      experience: '7 Years',
      address: 'Dhaka, Bangladesh',
      status: 'Active',
      image: 'assets/images (6).jpg'
    }
  ];

  getDoctors(): Doctor[] {
    return this.doctors;
  }

  getDoctorById(id: number): Doctor | undefined {
    return this.doctors.find(doctor => doctor.id === id);
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
        id
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
      ...this.doctors.map(doctor => doctor.id)
    ) + 1;
  }
}
