import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargeViewComponent } from './discharge-view.component';

describe('DischargeViewComponent', () => {
  let component: DischargeViewComponent;
  let fixture: ComponentFixture<DischargeViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DischargeViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DischargeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
