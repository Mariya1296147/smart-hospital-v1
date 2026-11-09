import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LaboratoryService } from '../../../core/services/laboratory.service';
import { LaboratoryWorkItem } from '../../../models/laboratory';
import { LaboratoryWorklistComponent } from './laboratory-worklist.component';

describe('LaboratoryWorklistComponent', () => {
  let fixture: ComponentFixture<LaboratoryWorklistComponent>;
  let laboratory: jasmine.SpyObj<LaboratoryService>;
  let auth: jasmine.SpyObj<AuthService>;

  const processingTest: LaboratoryWorkItem = {
    id: 17,
    prescriptionId: 42,
    patientName: 'Alex Patient',
    patientCode: 'PT-42',
    doctorName: 'Dr Green',
    departmentName: 'Medicine',
    testCode: 'CBC',
    testName: 'Complete Blood Count',
    testDate: '2026-11-08',
    status: 'PROCESSING'
  };

  beforeEach(async () => {
    laboratory = jasmine.createSpyObj<LaboratoryService>('LaboratoryService', ['getWorklist', 'getCompletedReports', 'updateTest']);
    laboratory.getWorklist.and.returnValue(of([processingTest]));
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['hasRole']);
    auth.hasRole.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [LaboratoryWorklistComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { data: { workflowView: 'IN_PROGRESS' } } } },
        { provide: LaboratoryService, useValue: laboratory },
        { provide: AuthService, useValue: auth }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LaboratoryWorklistComponent);
    fixture.detectChanges();
  });

  it('loads the in-progress filter once and displays the returned test', () => {
    const component = fixture.componentInstance;

    expect(laboratory.getWorklist).toHaveBeenCalledWith('IN_PROGRESS');
    expect(laboratory.getWorklist).toHaveBeenCalledTimes(1);
    expect(component.loading).toBeFalse();
    expect(component.items).toEqual([processingTest]);
    expect(fixture.nativeElement.textContent).toContain('Alex Patient');
    expect(fixture.nativeElement.textContent).toContain('Complete Blood Count');
  });

  it('clears loading and offers retry after an API failure', () => {
    laboratory.getWorklist.and.returnValue(throwError(() => ({ status: 0 })));
    fixture.componentInstance.load();
    fixture.detectChanges();

    expect(fixture.componentInstance.loading).toBeFalse();
    expect(fixture.componentInstance.errorMessage).toContain('unavailable');
    expect(fixture.nativeElement.textContent).toContain('Retry');
  });
});
