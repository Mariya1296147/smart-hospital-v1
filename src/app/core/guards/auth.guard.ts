
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check whether the user is logged in
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  // Check whether the user can access the requested URL
  if (authService.canAccessUrl(state.url)) {
    return true;
  }

  // Redirect to the logged-in user's dashboard
  return router.createUrlTree([
    authService.dashboardRoute()
  ]);
};
