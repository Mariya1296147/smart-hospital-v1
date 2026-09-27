import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationViewComponent } from './consultation-view.component';

describe('ConsultationViewComponent', () => {
  let component: ConsultationViewComponent;
  let fixture: ComponentFixture<ConsultationViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultationViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
