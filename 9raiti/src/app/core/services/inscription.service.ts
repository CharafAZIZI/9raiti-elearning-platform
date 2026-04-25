import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { InscriptionDTO } from '../../models/inscription.model';
import { ApprenantInscritDTO } from '../../models/apprenant-inscrit.model';

@Injectable({ providedIn: 'root' })
export class InscriptionService {

  private readonly api = (environment as any).springApiUrl ?? environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── APPRENANT ──────────────────────────────────────────────────────────────

  inscrire(moduleId: number): Observable<InscriptionDTO> {
    return this.http
      .post<InscriptionDTO>(`${this.api}/inscriptions/${moduleId}`, {})
      .pipe(catchError(this.handleError));
  }

  desinscrire(moduleId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.api}/inscriptions/${moduleId}`)
      .pipe(catchError(this.handleError));
  }

  getMesInscriptions(): Observable<InscriptionDTO[]> {
    return this.http
      .get<InscriptionDTO[]>(`${this.api}/inscriptions/mes-inscriptions`)
      .pipe(catchError(this.handleError));
  }

  estInscrit(moduleId: number): Observable<boolean> {
    return this.http
      .get<{ inscrit: boolean }>(`${this.api}/inscriptions/status/${moduleId}`)
      .pipe(
        map(res => res.inscrit),
        catchError(this.handleError)
      );
  }

  // ── ENSEIGNANT ─────────────────────────────────────────────────────────────

  /**
   * GET /api/inscriptions/module/{moduleId}/apprenants
   * Liste des apprenants inscrits à un module spécifique.
   */
  getApprenantsDuModule(moduleId: number): Observable<ApprenantInscritDTO[]> {
    return this.http
      .get<ApprenantInscritDTO[]>(`${this.api}/inscriptions/module/${moduleId}/apprenants`)
      .pipe(catchError(this.handleError));
  }

  /**
   * GET /api/inscriptions/mes-apprenants
   * Tous les apprenants inscrits aux modules de l'enseignant connecté.
   */
  getMesApprenants(): Observable<ApprenantInscritDTO[]> {
    return this.http
      .get<ApprenantInscritDTO[]>(`${this.api}/inscriptions/mes-apprenants`)
      .pipe(catchError(this.handleError));
  }

  // ── Error handler ──────────────────────────────────────────────────────────

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Erreur inconnue';
    if (error.status === 0)         message = 'Impossible de contacter le serveur.';
    else if (error.status === 401)  message = 'Non autorisé. Veuillez vous reconnecter.';
    else if (error.status === 403)  message = 'Accès refusé.';
    else if (error.status === 409)  message = 'Vous êtes déjà inscrit à ce module.';
    else if (error.status === 404)  message = 'Inscription ou module introuvable.';
    else if (error.error?.erreur)   message = error.error.erreur;
    else if (error.error?.message)  message = error.error.message;
    else message = `Erreur serveur ${error.status}`;
    console.error('[InscriptionService]', message, error);
    return throwError(() => new Error(message));
  }
}
