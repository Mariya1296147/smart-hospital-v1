
export interface PrescriptionMedicine {
  id?: number;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instruction: string;
}

export interface Prescription {
  id: number;

  patientId: number;
  doctorId: number;
  departmentId?: number | null;
  consultationId?: number | null;
  appointmentId?: number | null;
  appointmentStatus?: string | null;
  age?: number | null;
  gender?: string | null;
  admissionRequired?: boolean;
  admissionReason?: string | null;

  patientName: string;
  patientCode?: string;
  doctorName: string;
  departmentName: string;

  diagnosis: string;
  medicines: PrescriptionMedicine[];

  advice: string;
  date: string;
  tests?: PrescriptionTest[];
}

export interface PrescriptionTest {
  id?: number;
  catalogTestId: number;
  testCode: string;
  testName: string;
  price: number;
}

export type PrescriptionWriteRequest = Omit<Partial<Prescription>, 'tests'> & {
  tests?: Array<{ catalogTestId: number }>;
};

export interface TestCatalogItem {
  id?: number;
  code: string;
  name: string;
  description?: string | null;
  price: number;
  active: boolean;
}

export interface CompletedDoctorVisit {
  appointmentId: number;
  appointmentCode: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  reason?: string | null;
  notes?: string | null;
  age?: number | null;
  gender?: string | null;
  patientRecordId: number;
  patientCode: string;
  patientName: string;
  patientPhone?: string | null;
  doctorName: string;
  departmentName?: string | null;
  prescription: Prescription;
  receiptExists: boolean;
}
