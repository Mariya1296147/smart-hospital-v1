import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaboratorySidebarComponent } from './laboratory-sidebar.component';

describe('LaboratorySidebarComponent', () => {
  let component: LaboratorySidebarComponent;
  let fixture: ComponentFixture<LaboratorySidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaboratorySidebarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LaboratorySidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
