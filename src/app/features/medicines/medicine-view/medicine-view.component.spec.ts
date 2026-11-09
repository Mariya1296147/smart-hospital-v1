import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicineViewComponent } from './medicine-view.component';

describe('MedicineViewComponent', () => {
  let component: MedicineViewComponent;
  let fixture: ComponentFixture<MedicineViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MedicineViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
