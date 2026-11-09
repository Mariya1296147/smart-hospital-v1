export interface VitalSignRecord {
  id: number;
  patientId: number;
  patientName: string;
  patientCode: string;
  temperatureC?: number | null;
  pulseBpm?: number | null;
  respiratoryRate?: number | null;
  systolicBp?: number | null;
  diastolicBp?: number | null;
  oxygenSaturation?: number | null;
  recordedAt: string;
}

export interface NursingNoteRecord {
  id: number;
  patientId: number;
  patientName: string;
  patientCode: string;
  note: string;
  recordedAt: string;
}
