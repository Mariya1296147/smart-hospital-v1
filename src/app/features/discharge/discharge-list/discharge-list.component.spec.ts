import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargeListComponent } from './discharge-list.component';

describe('DischargeListComponent', () => {
  let component: DischargeListComponent;
  let fixture: ComponentFixture<DischargeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DischargeListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DischargeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
