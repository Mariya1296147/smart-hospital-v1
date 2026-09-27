import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.css'
})
export class DoctorsComponent {

  doctors = [
    {
      name: 'Dr. Sarah Ahmed',
      specialty: 'Cardiologist',
      department: 'Cardiology',
      experience: '12 Years Experience',
      qualification: 'MBBS, FCPS',
      image: 'assets/doctor 4.jpg'
    },
    {
      name: 'Dr. Rahim Khan',
      specialty: 'Neurologist',
      department: 'Neurology',
      experience: '10 Years Experience',
      qualification: 'MBBS, MD',
      image: 'assets/doctor11.jpg'
    },
    {
      name: 'Dr. Nusrat Jahan',
      specialty: 'Pediatrician',
      department: 'Pediatrics',
      experience: '8 Years Experience',
      qualification: 'MBBS, DCH',
      image: 'assets/doctor 9.jpeg'
    },
    {
      name: 'Dr. Tanvir Hasan',
      specialty: 'Orthopedic Surgeon',
      department: 'Orthopedics',
      experience: '11 Years Experience',
      qualification: 'MBBS, MS',
      image: 'assets/doctorss.avif'
    },
    {
      name: 'Dr. Maria Akter',
      specialty: 'Dermatologist',
      department: 'Dermatology',
      experience: '9 Years Experience',
      qualification: 'MBBS, DDV',
      image: 'assets/doctor10.avif'
    },
    {
      name: 'Dr. Farhan Ahmed',
      specialty: 'General Physician',
      department: 'General Medicine',
      experience: '7 Years Experience',
      qualification: 'MBBS, FCPS',
      image: 'assets/images (6).jpg'
    }
  ];

}