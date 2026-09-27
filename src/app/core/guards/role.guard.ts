import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../models/user';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const roles = route.data?.['roles'] as UserRole[] | undefined;
  if (!authService.isLoggedIn()) return router.createUrlTree(['/login']);
  return !roles || authService.hasAnyRole(roles)
    ? true
    : router.createUrlTree([authService.dashboardRoute()]);
};
