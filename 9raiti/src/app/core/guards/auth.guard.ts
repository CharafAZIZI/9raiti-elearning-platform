import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

/** Redirige vers le bon dashboard selon le rôle */
function redirectToDashboard(role: string | null, router: Router): void {
  const r = role?.toLowerCase();
  if (r === 'apprenant')       router.navigate(['/dashboard-apprenant']);
  else if (r === 'enseignant') router.navigate(['/dashboard-enseignant']);
  else if (r === 'admin')      router.navigate(['/dashboard-admin']);
  else                         router.navigate(['/login']);
}

/**
 * Vérifie que l'utilisateur est connecté.
 * Redirige vers /login avec returnUrl si non connecté.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router       = inject(Router);
  if (tokenService.isLoggedIn()) return true;
  router.navigate(['/login'], { queryParams: { returnUrl: state.url, reason: 'auth_required' } });
  return false;
};

/**
 * Vérifie le rôle exact de l'utilisateur.
 * Si connecté mais mauvais rôle → redirige vers son propre dashboard.
 */
export const roleGuard = (expectedRole: string): CanActivateFn => {
  return () => {
    const tokenService = inject(TokenService);
    const router       = inject(Router);
    if (!tokenService.isLoggedIn()) { router.navigate(['/login']); return false; }
    const role = tokenService.getRole()?.toLowerCase();
    if (role === expectedRole.toLowerCase()) return true;
    redirectToDashboard(role ?? null, router);
    return false;
  };
};

/**
 * Autorise plusieurs rôles (ex: enseignant + admin).
 */
export const multiRoleGuard = (...allowedRoles: string[]): CanActivateFn => {
  return () => {
    const tokenService = inject(TokenService);
    const router       = inject(Router);
    if (!tokenService.isLoggedIn()) { router.navigate(['/login']); return false; }
    const role = tokenService.getRole()?.toLowerCase();
    if (allowedRoles.map(r => r.toLowerCase()).includes(role ?? '')) return true;
    redirectToDashboard(role ?? null, router);
    return false;
  };
};

/**
 * Bloque l'accès aux pages d'auth pour les utilisateurs déjà connectés.
 * Redirige vers leur dashboard.
 */
export const guestGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router       = inject(Router);
  if (!tokenService.isLoggedIn()) return true;
  redirectToDashboard(tokenService.getRole(), router);
  return false;
};
