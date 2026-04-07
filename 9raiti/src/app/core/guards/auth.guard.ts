import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

export const authGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  if (tokenService.isLoggedIn()) return true;
  router.navigate(['/login']);
  return false;
};

export const roleGuard = (expectedRole: string): CanActivateFn => {
  return () => {
    const tokenService = inject(TokenService);
    const router = inject(Router);

    if (!tokenService.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }

    const role = tokenService.getRole()?.toLowerCase();
    if (role === expectedRole.toLowerCase()) return true;

    if (role === 'apprenant') router.navigate(['/dashboard-apprenant']);
    else if (role === 'enseignant') router.navigate(['/dashboard-enseignant']);
    else if (role === 'admin') router.navigate(['/dashboard-admin']);
    else router.navigate(['/login']);
    return false;
  };
};

export const guestGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (!tokenService.isLoggedIn()) return true;

  const role = tokenService.getRole()?.toLowerCase();
  if (role === 'apprenant') router.navigate(['/dashboard-apprenant']);
  else if (role === 'enseignant') router.navigate(['/dashboard-enseignant']);
  else if (role === 'admin') router.navigate(['/dashboard-admin']);
  else router.navigate(['/login']);
  return false;
};
