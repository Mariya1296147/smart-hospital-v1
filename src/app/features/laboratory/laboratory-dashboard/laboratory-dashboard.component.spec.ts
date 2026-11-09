import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LaboratoryDashboardComponent } from './laboratory-dashboard.component';
import { LaboratoryService } from '../../../core/services/laboratory.service';

describe('LaboratoryDashboardComponent', () => {
  let component: LaboratoryDashboardComponent;
  let fixture: ComponentFixture<LaboratoryDashboardComponent>;
  let laboratory: jasmine.SpyObj<LaboratoryService>;

  beforeEach(async () => {
    laboratory = jasmine.createSpyObj<LaboratoryService>('LaboratoryService', ['getWorklist']);
    laboratory.getWorklist.and.returnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [LaboratoryDashboardComponent],
      providers: [provideRouter([]), { provide: LaboratoryService, useValue: laboratory }]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LaboratoryDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(laboratory.getWorklist).toHaveBeenCalledTimes(1);
    expect(component.loading).toBeFalse();
  });

  it('clears loading and shows an error if the worklist request fails', () => {
    laboratory.getWorklist.and.returnValue(throwError(() => ({ status: 403 })));
    component.load();

    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toContain('permission');
  });
});
