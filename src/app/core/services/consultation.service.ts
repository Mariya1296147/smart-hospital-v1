import { Injectable } from '@angular/core';
import { Consultation } from '../../models/consultation';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {

  private consultations: Consultation[] = [
    {
      id: 1,
      consultationId: 'CON-1001',
      patientName: 'Mariya Rahman',
      patientId: 'P-1001',
      doctorName: 'Dr. Ahmed Rahman',
      department: 'Cardiology',
      date: '2026-09-15',
      time: '10:30 AM',
      type: 'Follow-up',
      symptoms: 'Chest pain and shortness of breath',
      diagnosis: 'Mild cardiac condition',
      notes: 'Patient advised to take proper rest.',
      prescription: 'Aspirin 75mg, Atorvastatin 20mg',
      status: 'Completed'
    },
    {
      id: 2,
      consultationId: 'CON-1002',
      patientName: 'Sarah Ahmed',
      patientId: 'P-1002',
      doctorName: 'Dr. Rahim Khan',
      department: 'Neurology',
      date: '2026-09-15',
      time: '11:00 AM',
      type: 'New Consultation',
      symptoms: 'Headache and dizziness',
      diagnosis: 'Migraine',
      notes: 'Patient advised to avoid stress.',
      prescription: 'Paracetamol 500mg',
      status: 'Completed'
    },
    {
      id: 3,
      consultationId: 'CON-1003',
      patientName: 'Karim Hasan',
      patientId: 'P-1003',
      doctorName: 'Dr. Nusrat Jahan',
      department: 'Pediatrics',
      date: '2026-09-16',
      time: '09:30 AM',
      type: 'New Consultation',
      symptoms: 'Fever and cough',
      diagnosis: 'Viral infection',
      notes: 'Keep the patient hydrated.',
      prescription: 'Paracetamol Syrup',
      status: 'Pending'
    },
    {
      id: 4,
      consultationId: 'CON-1004',
      patientName: 'Nusrat Akter',
      patientId: 'P-1004',
      doctorName: 'Dr. Tanvir Hasan',
      department: 'Orthopedics',
      date: '2026-09-16',
      time: '02:00 PM',
      type: 'Follow-up',
      symptoms: 'Knee pain',
      diagnosis: 'Joint inflammation',
      notes: 'Continue physiotherapy.',
      prescription: 'Pain relief medication',
      status: 'Pending'
    },
    {
      id: 5,
      consultationId: 'CON-1005',
      patientName: 'Imran Hossain',
      patientId: 'P-1005',
      doctorName: 'Dr. Maria Akter',
      department: 'Dermatology',
      date: '2026-09-17',
      time: '04:00 PM',
      type: 'New Consultation',
      symptoms: 'Skin irritation and itching',
      diagnosis: 'Skin allergy',
      notes: 'Avoid suspected allergens.',
      prescription: 'Antihistamine and topical cream',
      status: 'Completed'
    }
  ];

  getConsultations(): Consultation[] {
    return this.consultations;
  }

  getConsultationById(id: number): Consultation | undefined {
    return this.consultations.find(
      consultation => consultation.id === id
    );
  }

  addConsultation(consultation: Consultation): void {
    const newId = this.consultations.length > 0
      ? Math.max(...this.consultations.map(c => c.id)) + 1
      : 1;

    consultation.id = newId;
    this.consultations.push(consultation);
  }

  updateConsultation(updatedConsultation: Consultation): void {
    const index = this.consultations.findIndex(
      consultation => consultation.id === updatedConsultation.id
    );

    if (index !== -1) {
      this.consultations[index] = updatedConsultation;
    }
  }

  deleteConsultation(id: number): void {
    this.consultations = this.consultations.filter(
      consultation => consultation.id !== id
    );
  }
}