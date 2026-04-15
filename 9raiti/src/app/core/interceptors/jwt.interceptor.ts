import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const tokenService = inject(TokenService);
  const router       = inject(Router);
  const token        = tokenService.getToken();

  // Attache le token JWT si présent
  const authReq = token
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token) {
        // Seulement si l'utilisateur ÉTAIT connecté (token expiré) → déconnexion automatique
        tokenService.removeToken();
        router.navigate(['/login']);
      }
      // Si pas de token → appel public qui échoue → on ignore la redirection
      return throwError(() => error);
    })
  );
};
