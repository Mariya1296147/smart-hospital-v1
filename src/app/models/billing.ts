export type BillingServiceCategory =
  | 'LABORATORY_TEST'
  | 'DOCTOR_VISIT'
  | 'ADMISSION'
  | 'BED_CABIN'
  | 'PHARMACY'
  | 'OTHER';

export interface BillingItem {
  id?: number;
  serviceCategory: BillingServiceCategory | string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
  prescriptionTestId?: number | null;
  prescriptionTest?: { id: number } | null;
}

export interface Billing {
  id?: number;
  invoiceId: string;
  patientName: string;
  patientId: string;
  patientPhone?: string;
  doctor: string;
  department: string;
  serviceName: string;
  amount: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount?: number;
  paymentStatus: string;
  invoiceDate: string;
  appointmentId?: number | null;
  appointment?: { id?: number | null } | null;
  items?: BillingItem[];
  payments?: BillingPayment[];
}

export interface BillablePrescriptionTest {
  prescriptionTestId: number;
  prescriptionId: number;
  patientRecordId: number;
  patientId: string;
  patientName: string;
  doctorId: number;
  doctorName: string;
  departmentId?: number | null;
  departmentName?: string | null;
  diagnosis?: string | null;
  testCode: string;
  testName: string;
  price: number;
}

export interface BillingPayment {
  id: number;
  receiptNumber: string;
  amount: number;
  paymentMethod?: string | null;
  reference?: string | null;
  notes?: string | null;
  paidAt: string;
}

export interface BillingPaymentRequest {
  amount: number;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
}
