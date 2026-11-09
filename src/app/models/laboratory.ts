export interface Laboratory {
  id: number;
  testId: string;
  patientName: string;
  patientId?: string;
  testName: string;
  department: string;
  doctor: string;
  sampleDate: string;
  result: string;
  status: string;
}

export type LaboratoryWorkflowStatus = 'PENDING' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'COMPLETED';

export interface LaboratoryWorkItem {
  id: number;
  prescriptionId: number;
  invoiceId?: string | null;
  billingStatus?: string | null;
  patientName: string;
  patientCode: string;
  patientPhone?: string;
  doctorName: string;
  departmentName: string;
  diagnosis?: string;
  testCode: string;
  testName: string;
  testDate?: string | null;
  status: LaboratoryWorkflowStatus;
  sampleDate?: string | null;
  result?: string | null;
  remarks?: string | null;
  resultEnteredAt?: string | null;
}

export interface LaboratoryWorkflowUpdate {
  status: LaboratoryWorkflowStatus;
  sampleDate?: string;
  result?: string;
  remarks?: string;
}

export type LaboratoryWorkflowFilter = LaboratoryWorkflowStatus | 'IN_PROGRESS';
