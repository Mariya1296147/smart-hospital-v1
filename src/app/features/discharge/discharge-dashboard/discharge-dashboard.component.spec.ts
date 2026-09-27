import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargeDashboardComponent } from './discharge-dashboard.component';

describe('DischargeDashboardComponent', () => {
  let component: DischargeDashboardComponent;
  let fixture: ComponentFixture<DischargeDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DischargeDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DischargeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
