import { Routes } from '@angular/router';

import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

// Public
import { HomeComponent } from './features/public/home/home.component';
import { EmergencyComponent } from './features/public/emergency/emergency.component';
import { LaboratoryComponent } from './features/public/laboratory/laboratory.component';
import { PharmacyComponent } from './features/public/pharmacy/pharmacy.component';

// Auth
import { LoginComponent } from './features/auth/login/login.component';


// Guards
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

// Admin Dashboard
import { AdminDashboardComponent } from './features/dashboard/admin-dashboard/admin-dashboard.component';

// Patients
import { PatientListComponent } from './features/patients/patient-list/patient-list.component';
import { PatientFormComponent } from './features/patients/patient-form/patient-form.component';
import { PatientViewComponent } from './features/patients/patient-view/patient-view.component';

// Doctors
import { DoctorListComponent } from './features/doctors/doctor-list/doctor-list.component';
import { DoctorFormComponent } from './features/doctors/doctor-form/doctor-form.component';
import { DoctorViewComponent } from './features/doctors/doctor-view/doctor-view.component';

// Appointments
import { AppointmentListComponent } from './features/appointments/appointment-list/appointment-list.component';
import { AppointmentFormComponent } from './features/appointments/appointment-form/appointment-form.component';
import { AppointmentViewComponent } from './features/appointments/appointment-view/appointment-view.component';

// Consultations
import { ConsultationListComponent } from './features/consultations/consultation-list/consultation-list.component';
import { ConsultationFormComponent } from './features/consultations/consultation-form/consultation-form.component';
import { ConsultationViewComponent } from './features/consultations/consultation-view/consultation-view.component';

// Admissions
import { AdmissionListComponent } from './features/admissions/admission-list/admission-list.component';
import { AdmissionFormComponent } from './features/admissions/admission-form/admission-form.component';
import { AdmissionViewComponent } from './features/admissions/admission-view/admission-view.component';

// Nursing
import { NurseListComponent } from './features/nursing/nurse-list/nurse-list.component';
import { NurseFormComponent } from './features/nursing/nurse-form/nurse-form.component';
import { NurseViewComponent } from './features/nursing/nurse-view/nurse-view.component';

// Laboratory
import { LaboratoryListComponent } from './features/laboratory/laboratory-list/laboratory-list.component';
import { LaboratoryFormComponent } from './features/laboratory/laboratory-form/laboratory-form.component';
import { LaboratoryViewComponent } from './features/laboratory/laboratory-view/laboratory-view.component';

// Pharmacy
import { PharmacyListComponent } from './features/pharmacy/pharmacy-list/pharmacy-list.component';
import { PharmacyFormComponent } from './features/pharmacy/pharmacy-form/pharmacy-form.component';
import { PharmacyViewComponent } from './features/pharmacy/pharmacy-view/pharmacy-view.component';

// Billing
import { BillingListComponent } from './features/billing/billing-list/billing-list.component';
import { BillingFormComponent } from './features/billing/billing-form/billing-form.component';
import { BillingViewComponent } from './features/billing/billing-view/billing-view.component';

// Discharge
import { DischargeListComponent } from './features/discharge/discharge-list/discharge-list.component';
import { DischargeFormComponent } from './features/discharge/discharge-form/discharge-form.component';
import { DischargeViewComponent } from './features/discharge/discharge-view/discharge-view.component';

// Prescriptions
import { PrescriptionAddComponent } from './features/prescriptions/prescription-add/prescription-add.component';
import { DoctorLayoutComponent } from './layouts/doctor/doctor-layout/doctor-layout.component';


export const routes: Routes = [

  // =====================================================
  // PUBLIC WEBSITE
  // =====================================================

  {
    path: '',
    component: PublicLayoutComponent,
    children: [

      {
        path: '',
        component: HomeComponent
      },

      {
        path: 'about',
        loadComponent: () =>
          import('./features/public/about/about.component')
            .then(m => m.AboutComponent)
      },

      {
        path: 'services',
        loadComponent: () =>
          import('./features/public/services/services.component')
            .then(m => m.ServicesComponent)
      },

      {
        path: 'doctors',
        loadComponent: () =>
          import('./features/public/doctors/doctors.component')
            .then(m => m.DoctorsComponent)
      },

      {
        path: 'departments',
        loadComponent: () =>
          import('./features/public/departments/departments.component')
            .then(m => m.DepartmentsComponent)
      },

      {
        path: 'contact',
        loadComponent: () =>
          import('./features/public/contact/contact.component')
            .then(m => m.ContactComponent)
      },

      {
        path: 'patient-scan',
        loadComponent: () =>
          import('./features/public/patient-scan/patient-scan.component')
            .then(m => m.PatientScanComponent)
      },

      {
        path: 'appointment',
        loadComponent: () =>
          import('./features/public/appointment/appointment.component')
            .then(m => m.AppointmentComponent)
      },

      {
        path: 'emergency',
        component: EmergencyComponent
      },

      {
        path: 'laboratory',
        component: LaboratoryComponent
      },

      {
        path: 'pharmacy',
        component: PharmacyComponent
      }

    ]
  },


  // =====================================================
  // AUTH
  // =====================================================

  {
    path: 'login',
    component: LoginComponent
  },




  // =====================================================
  // ADMIN / STAFF PANEL
  // =====================================================

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],

    children: [

      // =================================================
      // DEFAULT ADMIN ROUTE
      // =================================================

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },


      // =================================================
      // DASHBOARDS
      // =================================================

      // ADMIN
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        canActivate: [roleGuard],
        data: {
          roles: ['admin']
        }
      },

      // DOCTOR
      {
        path: 'doctor-dashboard',
        loadComponent: () =>
          import('./features/dashboard/doctor-dashboard/doctor-dashboard.component')
            .then(m => m.DoctorDashboardComponent),
        canActivate: [roleGuard],
        data: {
          roles: ['doctor']
        }
      },

      // RECEPTIONIST
      {
        path: 'reception-dashboard',
        loadComponent: () =>
          import('./features/dashboard/reception-dashboard/reception-dashboard.component')
            .then(m => m.ReceptionDashboardComponent),
        canActivate: [roleGuard],
        data: {
          roles: ['receptionist']
        }
      },

      // NURSE
      {
        path: 'nurse-dashboard',
        loadComponent: () =>
          import('./features/dashboard/nurse-dashboard/nurse-dashboard.component')
            .then(m => m.NurseDashboardComponent),
        canActivate: [roleGuard],
        data: {
          roles: ['nurse']
        }
      },

      // LABORATORY STAFF
      {
        path: 'laboratory-dashboard',
        loadComponent: () =>
          import('./features/laboratory/laboratory-dashboard/laboratory-dashboard.component')
            .then(m => m.LaboratoryDashboardComponent),
        canActivate: [roleGuard],
        data: {
          roles: ['laboratory_staff']
        }
      },

      // PHARMACY STAFF
      {
        path: 'pharmacy-dashboard',
        loadComponent: () =>
          import('./features/pharmacy/pharmacy-dashboard/pharmacy-dashboard.component')
            .then(m => m.PharmacyDashboardComponent),
        canActivate: [roleGuard],
        data: {
          roles: ['pharmacy_staff']
        }
      },

      // ACCOUNTS STAFF
      {
        path: 'accounts-dashboard',
        loadComponent: () =>
          import('./features/dashboard/billing-dashboard/billing-dashboard.component')
            .then(m => m.BillingDashboardComponent),
        canActivate: [roleGuard],
        data: {
          roles: ['accounts_staff']
        }
      },


      // =================================================
      // USER MANAGEMENT
      // =================================================

      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/user-management.component')
            .then(m => m.UserManagementComponent),
        canActivate: [roleGuard],
        data: {
          roles: ['admin']
        }
      },


      // =================================================
      // REPORTS
      // =================================================

      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports-dashboard/reports-dashboard.component')
            .then(m => m.ReportsDashboardComponent),
        canActivate: [roleGuard],
        data: {
          roles: ['admin']
        }
      },


      // =================================================
      // SETTINGS
      // =================================================

      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component')
            .then(m => m.SettingsComponent),
        canActivate: [roleGuard],
        data: {
          roles: ['admin']
        }
      },


      // =================================================
      // PATIENTS
      // =================================================

      {
        path: 'patients',
        component: PatientListComponent
      },

      {
        path: 'patients/add',
        component: PatientFormComponent
      },

      {
        path: 'patients/edit/:id',
        component: PatientFormComponent
      },

      {
        path: 'patients/view/:id',
        component: PatientViewComponent
      },


      // =================================================
      // DOCTORS
      // =================================================

      {
        path: 'doctors',
        component: DoctorListComponent
      },

      {
        path: 'doctors/add',
        component: DoctorFormComponent
      },

      {
        path: 'doctors/edit/:id',
        component: DoctorFormComponent
      },

      {
        path: 'doctors/view/:id',
        component: DoctorViewComponent
      },


      // =================================================
      // APPOINTMENTS
      // =================================================

      {
        path: 'appointments',
        component: AppointmentListComponent
      },

      {
        path: 'appointments/add',
        component: AppointmentFormComponent
      },

      {
        path: 'appointments/edit/:id',
        component: AppointmentFormComponent
      },

      {
        path: 'appointments/view/:id',
        component: AppointmentViewComponent
      },


      // =================================================
      // CONSULTATIONS
      // =================================================

      {
        path: 'consultations',
        component: ConsultationListComponent
      },

      {
        path: 'consultations/add',
        component: ConsultationFormComponent
      },

      {
        path: 'consultations/edit/:id',
        component: ConsultationFormComponent
      },

      {
        path: 'consultations/view/:id',
        component: ConsultationViewComponent
      },


      // =================================================
      // ADMISSIONS
      // =================================================

      {
        path: 'admissions',
        component: AdmissionListComponent
      },

      {
        path: 'admissions/add',
        component: AdmissionFormComponent
      },

      {
        path: 'admissions/edit/:id',
        component: AdmissionFormComponent
      },

      {
        path: 'admissions/view/:id',
        component: AdmissionViewComponent
      },


      // =================================================
      // NURSING
      // =================================================

      {
        path: 'nursing',
        component: NurseListComponent
      },

      {
        path: 'nursing/add',
        component: NurseFormComponent
      },

      {
        path: 'nursing/edit/:id',
        component: NurseFormComponent
      },

      {
        path: 'nursing/view/:id',
        component: NurseViewComponent
      },


      // =================================================
      // LABORATORY
      // =================================================

      {
        path: 'laboratory',
        component: LaboratoryListComponent
      },

      {
        path: 'laboratory/add',
        component: LaboratoryFormComponent
      },

      {
        path: 'laboratory/edit/:id',
        component: LaboratoryFormComponent
      },

      {
        path: 'laboratory/view/:id',
        component: LaboratoryViewComponent
      },


      // =================================================
      // PHARMACY
      // =================================================

      {
        path: 'pharmacy',
        component: PharmacyListComponent
      },

      {
        path: 'pharmacy/add',
        component: PharmacyFormComponent
      },

      {
        path: 'pharmacy/edit/:id',
        component: PharmacyFormComponent
      },

      {
        path: 'pharmacy/view/:id',
        component: PharmacyViewComponent
      },


      // =================================================
      // BILLING
      // =================================================

      {
        path: 'billing',
        component: BillingListComponent
      },

      {
        path: 'billing/add',
        component: BillingFormComponent
      },

      {
        path: 'billing/edit/:id',
        component: BillingFormComponent
      },

      {
        path: 'billing/view/:id',
        component: BillingViewComponent
      },


      // =================================================
      // DISCHARGE
      // =================================================

      {
        path: 'discharge',
        component: DischargeListComponent
      },

      {
        path: 'discharge/add',
        component: DischargeFormComponent
      },

      {
        path: 'discharge/edit/:id',
        component: DischargeFormComponent
      },

      {
        path: 'discharge/view/:id',
        component: DischargeViewComponent
      },


      // =================================================
      // PRESCRIPTIONS
      // =================================================

      {
        path: 'prescriptions/add/:patientId',
        component: PrescriptionAddComponent,
        canActivate: [roleGuard],
        data: {
          roles: ['doctor']
        }
      }

    ]
  },
  {
    path: 'doctor',
    component: DoctorLayoutComponent,
    canActivate: [authGuard],
    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/doctor-dashboard/doctor-dashboard.component')
            .then(m => m.DoctorDashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['doctor'] }
      },

      {
        path: 'profile',
        loadComponent: () =>
          import('./features/doctor/profile/profile.component')
            .then(m => m.ProfileComponent),
        canActivate: [roleGuard],
        data: { roles: ['doctor'] }
      }

    ]
  },

 

{
  path: 'accounts',
  component: AdminLayoutComponent,
  canActivate: [authGuard],
  children: [
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full'
    },
    {
      path: 'dashboard',
      loadComponent: () =>
        import('./features/dashboard/accounts-dashboard/accounts-dashboard.component')
          .then(m => m.AccountsDashboardComponent),
      canActivate: [roleGuard],
      data: {
        roles: ['accounts_staff']
      }
    }
  ]
},

  // =====================================================
  // INVALID URL
  // =====================================================

  {
    path: '**',
    redirectTo: ''
  }

];