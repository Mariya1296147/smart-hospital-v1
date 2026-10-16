import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { JwtResponse, LoginRequest, RegisterRequest, UserDTO, UserRole } from '../../models/user';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = 'http://localhost:9090/api';
  private readonly tokenKey = 'hospital-jwt-token';
  private readonly userKey = 'hospital-current-user';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // =========================
  // LOGIN
  // =========================

  login(request: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(
      `${this.apiUrl}/auth/signin`,
      request
    ).pipe(
      tap(response => {
        console.log("---------------------------------------");
        
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(
          this.userKey,
          JSON.stringify(response.user)
        );
      })
    );
  }

  // =========================
  // REGISTER
  // =========================

  register(request: RegisterRequest): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/auth/signup`,
      request,
      { responseType: 'text' }
    );
  }

  // =========================
  // LOGOUT
  // =========================

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.router.navigate(['/login']);
  }

  // =========================
  // TOKEN
  // =========================

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // =========================
  // CURRENT USER
  // =========================

  getCurrentUser(): UserDTO | null {
    const user = localStorage.getItem(this.userKey);

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as UserDTO;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }

  // =========================
  // AUTH STATUS
  // =========================

  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  // =========================
  // ROLE CHECK
  // =========================

  hasRole(role: UserRole): boolean {
    return this.getCurrentUser()?.roles?.includes(role) ?? false;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();

    return !!user && user.roles.some(role => roles.includes(role));
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  // =========================
  // DASHBOARD ROUTE
  // =========================

  dashboardRoute(): string {
    const user = this.getCurrentUser();

    if (!user || !user.roles?.length) {
      return '/login';
    }

    const routes: Record<UserRole, string> = {
      ADMIN: '/admin/dashboard',
      DOCTOR: '/doctor/dashboard',
      RECEPTIONIST: '/reception/dashboard',
      NURSE: '/nurse/dashboard',
      LABORATORY_STAFF: '/laboratory/dashboard',
      PHARMACY_STAFF: '/pharmacy/dashboard',
      ACCOUNTS_STAFF: '/accounts/dashboard'
    };

    return routes[user.roles[0]] ?? '/login';
  }

  // =========================
  // REDIRECT AFTER LOGIN
  // =========================

  redirectToDashboard(): void {
    this.router.navigateByUrl(this.dashboardRoute());
  }

  // =========================
  // USER MANAGEMENT
  // =========================

  getAllUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/users`);
  }

  getUserByUsername(username: string): Observable<UserDTO> {
    return this.http.get<UserDTO>(
      `${this.apiUrl}/users/${encodeURIComponent(username)}`
    );
  }

  updateUser(
    username: string,
    user: Partial<UserDTO>
  ): Observable<UserDTO> {
    return this.http.put<UserDTO>(
      `${this.apiUrl}/users/${encodeURIComponent(username)}`,
      user
    );
  }

  deleteUser(username: string): Observable<string> {
    return this.http.delete(
      `${this.apiUrl}/users/${encodeURIComponent(username)}`,
      { responseType: 'text' }
    );
  }

  updateUserStatus(
    username: string,
    enabled: boolean
  ): Observable<UserDTO> {
    return this.http.patch<UserDTO>(
      `${this.apiUrl}/users/${encodeURIComponent(username)}/status`,
      { enabled }
    );
  }

  // =========================
  // AUTHORIZATION HEADER
  // =========================

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();

    return new HttpHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  
// isLoggedIn(): boolean {
//   return !!this.getToken() && !!this.getCurrentUser();
// }

// dashboardRoute(): string {
//   const user = this.getCurrentUser();

//   if (!user || !user.roles?.length) {
//     return '/login';
//   }

//   const role = user.roles[0];

//   const routes: Record<string, string> = {
//     ADMIN: '/admin/dashboard',
//     DOCTOR: '/doctor/dashboard',
//     RECEPTIONIST: '/reception/dashboard',
//     NURSE: '/nurse/dashboard',
//     LABORATORY_STAFF: '/laboratory/dashboard',
//     PHARMACY_STAFF: '/pharmacy/dashboard',
//     ACCOUNTS_STAFF: '/accounts/dashboard'
//   };

//   return routes[role] ?? '/login';
// }

canAccessUrl(url: string): boolean {
  const user = this.getCurrentUser();

  if (!user || !user.roles?.length) {
    return false;
  }

  const dashboardRoutes: Record<string, string> = {
    ADMIN: '/admin',
    DOCTOR: '/doctor',
    RECEPTIONIST: '/reception',
    NURSE: '/nurse',
    LABORATORY_STAFF: '/laboratory',
    PHARMACY_STAFF: '/pharmacy',
    ACCOUNTS_STAFF: '/accounts'
  };

  return user.roles.some(role => {
    const baseRoute = dashboardRoutes[role];

    return !!baseRoute &&
      (url === baseRoute || url.startsWith(baseRoute + '/'));
  });
}

}