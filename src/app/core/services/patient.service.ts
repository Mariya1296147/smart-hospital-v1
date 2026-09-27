import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  private patients = [

    {
      id: 1,
      patientId: 'P-1001',
      firstName: 'Mariya',
      lastName: 'Rahman',
      name: 'Mariya Rahman',
      gender: 'Female',
      dateOfBirth: '1998-05-15',
      age: 28,
      bloodGroup: 'B+',
      phone: '01712345678',
      email: 'mariya@example.com',
      address: 'Chattogram, Bangladesh',
      emergencyContact: '01812345678',
      department: 'Cardiology',
      doctor: 'Dr. Ahmed',
      maritalStatus: 'Single',
      allergies: 'No known allergies',
      medicalHistory: 'No major medical history',
      status: 'Active'
    },

    {
      id: 2,
      patientId: 'P-1002',
      firstName: 'Sarah',
      lastName: 'Ahmed',
      name: 'Sarah Ahmed',
      gender: 'Female',
      dateOfBirth: '1991-08-20',
      age: 35,
      bloodGroup: 'A+',
      phone: '01812345678',
      email: 'sarah@example.com',
      address: 'Dhaka, Bangladesh',
      emergencyContact: '01912345678',
      department: 'Neurology',
      doctor: 'Dr. Rahman',
      maritalStatus: 'Married',
      allergies: 'Penicillin',
      medicalHistory: 'Migraine',
      status: 'Active'
    },

    {
      id: 3,
      patientId: 'P-1003',
      firstName: 'Mohammad',
      lastName: 'Karim',
      name: 'Mohammad Karim',
      gender: 'Male',
      dateOfBirth: '1984-03-10',
      age: 42,
      bloodGroup: 'O+',
      phone: '01912345678',
      email: 'karim@example.com',
      address: 'Chattogram, Bangladesh',
      emergencyContact: '01612345678',
      department: 'Orthopedics',
      doctor: 'Dr. Karim',
      maritalStatus: 'Married',
      allergies: 'None',
      medicalHistory: 'Back pain',
      status: 'Pending'
    },

    {
      id: 4,
      patientId: 'P-1004',
      firstName: 'Nusrat',
      lastName: 'Sultana',
      name: 'Nusrat Sultana',
      gender: 'Female',
      dateOfBirth: '2002-01-15',
      age: 24,
      bloodGroup: 'AB+',
      phone: '01612345678',
      email: 'nusrat@example.com',
      address: 'Cumilla, Bangladesh',
      emergencyContact: '01712345678',
      department: 'Pediatrics',
      doctor: 'Dr. Fatima',
      maritalStatus: 'Single',
      allergies: 'Dust',
      medicalHistory: 'Asthma',
      status: 'Active'
    },

    {
      id: 5,
      patientId: 'P-1005',
      firstName: 'Abdullah',
      lastName: 'Hasan',
      name: 'Abdullah Hasan',
      gender: 'Male',
      dateOfBirth: '1975-06-25',
      age: 51,
      bloodGroup: 'B-',
      phone: '01512345678',
      email: 'abdullah@example.com',
      address: 'Chattogram, Bangladesh',
      emergencyContact: '01812345678',
      department: 'Medicine',
      doctor: 'Dr. Ahmed',
      maritalStatus: 'Married',
      allergies: 'None',
      medicalHistory: 'Diabetes',
      status: 'Inactive'
    }

  ];


  // Get all patients
  getPatients() {
    return this.patients;
  }


  // Get single patient
  getPatientById(id: number) {

    return this.patients.find(
      patient => patient.id === id
    );

  }


  // Update patient
  updatePatient(id: number, updatedPatient: any) {

    const index = this.patients.findIndex(
      patient => patient.id === id
    );

    if (index !== -1) {

      this.patients[index] = {
        ...this.patients[index],
        ...updatedPatient,
        name: `${updatedPatient.firstName} ${updatedPatient.lastName}`
      };

      return true;
    }

    return false;
  }


  // Add new patient
  addPatient(patient: any) {

    const newId =
      this.patients.length > 0
        ? Math.max(
            ...this.patients.map(p => p.id)
          ) + 1
        : 1;

    const newPatient = {

      ...patient,

      id: newId,

      patientId: `P-${1000 + newId}`,

      name: `${patient.firstName} ${patient.lastName}`,

      status: 'Active'

    };

    this.patients.push(newPatient);
  }


  // Delete patient
  deletePatient(id: number) {

    const index = this.patients.findIndex(
      patient => patient.id === id
    );

    if (index !== -1) {

      this.patients.splice(index, 1);

      return true;
    }

    return false;
  }

}