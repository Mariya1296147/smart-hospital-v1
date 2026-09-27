import { Injectable } from '@angular/core';
import { Billing } from '../../models/billing';


@Injectable({
  providedIn: 'root'
})
export class BillingService {

  private bills: Billing[] = [

    {
      id: 1,
      invoiceId: 'INV-1001',
      patientName: 'Mariya Rahman',
      patientId: 'P-1001',
      doctor: 'Dr. Ahmed Khan',
      department: 'Cardiology',
      serviceName: 'Cardiology Consultation',
      amount: 1500,
      discount: 100,
      tax: 70,
      totalAmount: 1470,
      paymentStatus: 'Paid',
      invoiceDate: '2026-09-18'
    },

    {
      id: 2,
      invoiceId: 'INV-1002',
      patientName: 'Sarah Ahmed',
      patientId: 'P-1002',
      doctor: 'Dr. Nusrat Jahan',
      department: 'Neurology',
      serviceName: 'Neurology Consultation',
      amount: 1800,
      discount: 0,
      tax: 90,
      totalAmount: 1890,
      paymentStatus: 'Paid',
      invoiceDate: '2026-09-18'
    },

    {
      id: 3,
      invoiceId: 'INV-1003',
      patientName: 'Rahim Uddin',
      patientId: 'P-1003',
      doctor: 'Dr. Ahmed Khan',
      department: 'Cardiology',
      serviceName: 'ECG + Consultation',
      amount: 2500,
      discount: 200,
      tax: 115,
      totalAmount: 2415,
      paymentStatus: 'Pending',
      invoiceDate: '2026-09-19'
    },

    {
      id: 4,
      invoiceId: 'INV-1004',
      patientName: 'Nusrat Akter',
      patientId: 'P-1004',
      doctor: 'Dr. Farhan Ahmed',
      department: 'Medicine',
      serviceName: 'General Consultation',
      amount: 1000,
      discount: 50,
      tax: 47.5,
      totalAmount: 997.5,
      paymentStatus: 'Pending',
      invoiceDate: '2026-09-19'
    },

    {
      id: 5,
      invoiceId: 'INV-1005',
      patientName: 'Imran Hossain',
      patientId: 'P-1005',
      doctor: 'Dr. Sadia Rahman',
      department: 'Orthopedics',
      serviceName: 'Orthopedic Consultation',
      amount: 2000,
      discount: 0,
      tax: 100,
      totalAmount: 2100,
      paymentStatus: 'Paid',
      invoiceDate: '2026-09-20'
    },

    {
      id: 6,
      invoiceId: 'INV-1006',
      patientName: 'Ayesha Rahman',
      patientId: 'P-1006',
      doctor: 'Dr. Kamal Hossain',
      department: 'Laboratory',
      serviceName: 'Complete Blood Count (CBC)',
      amount: 800,
      discount: 50,
      tax: 37.5,
      totalAmount: 787.5,
      paymentStatus: 'Overdue',
      invoiceDate: '2026-09-15'
    }

  ];

  getBills(): Billing[] {
    return this.bills;
  }

  getBillById(id: number): Billing | undefined {
    return this.bills.find(
      bill => bill.id === id
    );
  }

  addBill(bill: Billing): void {

    const newId =
      this.bills.length > 0
        ? Math.max(
            ...this.bills.map(
              bill => bill.id
            )
          ) + 1
        : 1;

    bill.id = newId;

    this.bills.push(bill);
  }

  updateBill(bill: Billing): void {

    const index =
      this.bills.findIndex(
        item => item.id === bill.id
      );

    if (index !== -1) {
      this.bills[index] = bill;
    }
  }

  deleteBill(id: number): void {

    this.bills =
      this.bills.filter(
        bill => bill.id !== id
      );
  }

}