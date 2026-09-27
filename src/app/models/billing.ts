export interface Billing {
  id: number;
  invoiceId: string;
  patientName: string;
  patientId: string;
  doctor: string;
  department: string;
  serviceName: string;
  amount: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentStatus: string;
  invoiceDate: string;
}