import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmissionDashboardComponent } from './admission-dashboard.component';

describe('AdmissionDashboardComponent', () => {
  let component: AdmissionDashboardComponent;
  let fixture: ComponentFixture<AdmissionDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmissionDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdmissionDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
