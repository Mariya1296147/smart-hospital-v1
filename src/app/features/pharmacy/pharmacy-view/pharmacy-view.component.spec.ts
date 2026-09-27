import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyViewComponent } from './pharmacy-view.component';

describe('PharmacyViewComponent', () => {
  let component: PharmacyViewComponent;
  let fixture: ComponentFixture<PharmacyViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PharmacyViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
