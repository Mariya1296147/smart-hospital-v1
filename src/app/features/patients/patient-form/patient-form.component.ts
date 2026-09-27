import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.css'
})
export class PatientFormComponent {

  isEditMode = false;

  patientId: number | null = null;


  patient = {

    firstName: '',
    lastName: '',
    gender: '',
    age: 0,
    dateOfBirth: '',
    bloodGroup: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    department: '',
    doctor: '',
    maritalStatus: '',
    allergies: '',
    medicalHistory: ''

  };


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private patientService: PatientService
  ) {

    const id =
      this.route.snapshot.paramMap.get('id');


    // ================= EDIT MODE =================

    if (id) {

      this.isEditMode = true;

      this.patientId = Number(id);


      const existingPatient =
        this.patientService.getPatientById(
          this.patientId
        );


      if (existingPatient) {

        this.patient = {

          firstName: existingPatient.firstName,

          lastName: existingPatient.lastName,

          gender: existingPatient.gender,

          age: existingPatient.age,

          dateOfBirth:
            existingPatient.dateOfBirth,

          bloodGroup:
            existingPatient.bloodGroup,

          phone:
            existingPatient.phone,

          email:
            existingPatient.email,

          address:
            existingPatient.address,

          emergencyContact:
            existingPatient.emergencyContact,

          department:
            existingPatient.department,

          doctor:
            existingPatient.doctor,

          maritalStatus:
            existingPatient.maritalStatus,

          allergies:
            existingPatient.allergies,

          medicalHistory:
            existingPatient.medicalHistory

        };

      }

    }

  }


  // ================= SAVE / UPDATE =================

  savePatient() {

    if (
      this.isEditMode &&
      this.patientId !== null
    ) {

      this.patientService.updatePatient(
        this.patientId,
        this.patient
      );

      alert(
        'Patient updated successfully!'
      );

    }

    else {

      this.patientService.addPatient(
        this.patient
      );

      alert(
        'Patient added successfully!'
      );

    }


    // Go back to patient list

    this.router.navigate(
      ['/admin/patients']
    );

  }


  // ================= RESET =================

  resetForm() {

    if (
      this.isEditMode &&
      this.patientId !== null
    ) {

      const existingPatient =
        this.patientService.getPatientById(
          this.patientId
        );


      if (existingPatient) {

        this.patient = {

          firstName:
            existingPatient.firstName,

          lastName:
            existingPatient.lastName,

          gender:
            existingPatient.gender,

          age:
            existingPatient.age,

          dateOfBirth:
            existingPatient.dateOfBirth,

          bloodGroup:
            existingPatient.bloodGroup,

          phone:
            existingPatient.phone,

          email:
            existingPatient.email,

          address:
            existingPatient.address,

          emergencyContact:
            existingPatient.emergencyContact,

          department:
            existingPatient.department,

          doctor:
            existingPatient.doctor,

          maritalStatus:
            existingPatient.maritalStatus,

          allergies:
            existingPatient.allergies,

          medicalHistory:
            existingPatient.medicalHistory

        };

      }

    }

    else {

      this.patient = {

        firstName: '',
        lastName: '',
        gender: '',
        age: 0,
        dateOfBirth: '',
        bloodGroup: '',
        phone: '',
        email: '',
        address: '',
        emergencyContact: '',
        department: '',
        doctor: '',
        maritalStatus: '',
        allergies: '',
        medicalHistory: ''

      };

    }

  }

}