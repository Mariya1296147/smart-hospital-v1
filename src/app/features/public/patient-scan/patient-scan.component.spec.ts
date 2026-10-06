import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientScanComponent } from './patient-scan.component';

describe('PatientScanComponent', () => {
  let component: PatientScanComponent;
  let fixture: ComponentFixture<PatientScanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientScanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PatientScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('recognizes an existing patient ID without exposing the record', () => {
    component.patientId = ' p-1001 ';
    component.searchPatient();

    expect(component.patientId).toBe('P-1001');
    expect(component.messageType).toBe('success');
  });

  it('shows an error for an unknown patient ID', () => {
    component.patientId = 'P-9999';
    component.searchPatient();

    expect(component.messageType).toBe('error');
    expect(component.message).toContain('contact hospital reception');
  });
});
