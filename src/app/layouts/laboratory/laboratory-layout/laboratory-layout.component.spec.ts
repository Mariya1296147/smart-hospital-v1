import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaboratoryLayoutComponent } from './laboratory-layout.component';

describe('LaboratoryLayoutComponent', () => {
  let component: LaboratoryLayoutComponent;
  let fixture: ComponentFixture<LaboratoryLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaboratoryLayoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LaboratoryLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
