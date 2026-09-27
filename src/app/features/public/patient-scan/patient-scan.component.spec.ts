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
});
