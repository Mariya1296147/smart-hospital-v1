import { Injectable } from '@angular/core';
import { Pharmacy } from '../../models/Pharmacy';

@Injectable({
  providedIn: 'root'
})
export class PharmacyService {

  private medicines: Pharmacy[] = [

    {
      id: 1,
      medicineId: 'MED-1001',
      medicineName: 'Paracetamol 500mg',
      category: 'Pain Relief',
      manufacturer: 'Square Pharmaceuticals',
      quantity: 850,
      unitPrice: 2.50,
      expiryDate: '2028-06-30',
      supplier: 'Square Pharma',
      status: 'Available'
    },

    {
      id: 2,
      medicineId: 'MED-1002',
      medicineName: 'Amoxicillin 500mg',
      category: 'Antibiotic',
      manufacturer: 'Beximco Pharmaceuticals',
      quantity: 320,
      unitPrice: 8.00,
      expiryDate: '2027-11-20',
      supplier: 'Beximco Pharma',
      status: 'Available'
    },

    {
      id: 3,
      medicineId: 'MED-1003',
      medicineName: 'Omeprazole 20mg',
      category: 'Gastric',
      manufacturer: 'Renata Limited',
      quantity: 75,
      unitPrice: 5.00,
      expiryDate: '2027-08-15',
      supplier: 'Renata Pharma',
      status: 'Low Stock'
    },

    {
      id: 4,
      medicineId: 'MED-1004',
      medicineName: 'Azithromycin 500mg',
      category: 'Antibiotic',
      manufacturer: 'Healthcare Pharmaceuticals',
      quantity: 12,
      unitPrice: 25.00,
      expiryDate: '2027-03-10',
      supplier: 'Healthcare Pharma',
      status: 'Low Stock'
    },

    {
      id: 5,
      medicineId: 'MED-1005',
      medicineName: 'Insulin Glargine',
      category: 'Diabetes',
      manufacturer: 'Novo Nordisk',
      quantity: 0,
      unitPrice: 950.00,
      expiryDate: '2027-05-31',
      supplier: 'Novo Nordisk',
      status: 'Out of Stock'
    },

    {
      id: 6,
      medicineId: 'MED-1006',
      medicineName: 'Salbutamol Inhaler',
      category: 'Respiratory',
      manufacturer: 'GlaxoSmithKline',
      quantity: 0,
      unitPrice: 220.00,
      expiryDate: '2027-09-30',
      supplier: 'GSK',
      status: 'Out of Stock'
    },

    {
      id: 7,
      medicineId: 'MED-1007',
      medicineName: 'Metformin 500mg',
      category: 'Diabetes',
      manufacturer: 'ACI Limited',
      quantity: 460,
      unitPrice: 3.00,
      expiryDate: '2028-01-25',
      supplier: 'ACI Pharma',
      status: 'Available'
    },

    {
      id: 8,
      medicineId: 'MED-1008',
      medicineName: 'Ceftriaxone 1g Injection',
      category: 'Antibiotic',
      manufacturer: 'Aristopharma',
      quantity: 95,
      unitPrice: 85.00,
      expiryDate: '2027-12-15',
      supplier: 'Aristopharma',
      status: 'Available'
    },

    {
      id: 9,
      medicineId: 'MED-1009',
      medicineName: 'Cetirizine 10mg',
      category: 'Antihistamine',
      manufacturer: 'Opsonin Pharma',
      quantity: 40,
      unitPrice: 1.50,
      expiryDate: '2026-12-10',
      supplier: 'Opsonin Pharma',
      status: 'Low Stock'
    },

    {
      id: 10,
      medicineId: 'MED-1010',
      medicineName: 'Diclofenac 50mg',
      category: 'Pain Relief',
      manufacturer: 'Incepta Pharmaceuticals',
      quantity: 0,
      unitPrice: 4.00,
      expiryDate: '2026-09-01',
      supplier: 'Incepta Pharma',
      status: 'Expired'
    }

  ];


  getMedicines(): Pharmacy[] {
    return this.medicines;
  }


  getMedicineById(id: number): Pharmacy | undefined {
    return this.medicines.find(
      medicine => medicine.id === id
    );
  }


  addMedicine(medicine: Pharmacy): void {

    const newId =
      this.medicines.length > 0
        ? Math.max(
            ...this.medicines.map(
              medicine => medicine.id
            )
          ) + 1
        : 1;

    medicine.id = newId;

    this.medicines.push(medicine);
  }


  updateMedicine(medicine: Pharmacy): void {

    const index =
      this.medicines.findIndex(
        item => item.id === medicine.id
      );

    if (index !== -1) {
      this.medicines[index] = medicine;
    }
  }


  deleteMedicine(id: number): void {

    this.medicines =
      this.medicines.filter(
        medicine => medicine.id !== id
      );
  }

}