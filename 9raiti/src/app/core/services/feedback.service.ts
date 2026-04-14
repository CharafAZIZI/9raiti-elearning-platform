// src/app/core/services/feedback.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  FeedbackDTO,
  FeedbackReponseDTO,
  TypeAvis,
  StatutFeedback
} from '../../models/feedback.model';

@Injectable({ providedIn: 'root' })
export class FeedbackService {

  private readonly api = `${environment.apiUrl}/feedbacks`;

  constructor(private http: HttpClient) {}

  // ── Soumission visiteur anonyme (page Home, sans JWT) ─────────────────────
  soumettreAnonyme(dto: FeedbackDTO): Observable<FeedbackDTO> {
    return this.http.post<FeedbackDTO>(`${this.api}/anonyme`, dto)
      .pipe(catchError(this.handleError));
  }

  // ── Soumission utilisateur connecté (Apprenant / Enseignant) ─────────────
  // Le JWT est automatiquement attaché par le jwtInterceptor.
  soumettreAuthentifie(dto: FeedbackDTO): Observable<FeedbackDTO> {
    return this.http.post<FeedbackDTO>(`${this.api}`, dto)
      .pipe(catchError(this.handleError));
  }

  // ── Admin : liste tous les feedbacks (avec filtres optionnels) ────────────
  getAll(type?: TypeAvis, statut?: StatutFeedback): Observable<FeedbackDTO[]> {
    let params = new HttpParams();
    if (type)   params = params.set('type',   type);
    if (statut) params = params.set('statut', statut);
    return this.http.get<FeedbackDTO[]>(this.api, { params })
      .pipe(catchError(this.handleError));
  }

  // ── Admin : détail d'un feedback ─────────────────────────────────────────
  getById(id: number): Observable<FeedbackDTO> {
    return this.http.get<FeedbackDTO>(`${this.api}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // ── Enseignant : avis sur un cours spécifique ─────────────────────────────
  getByCours(coursId: number): Observable<FeedbackDTO[]> {
    return this.http.get<FeedbackDTO[]>(`${this.api}/cours/${coursId}`)
      .pipe(catchError(this.handleError));
  }

  // ── Admin : répondre à un feedback ───────────────────────────────────────
  repondre(id: number, reponse: FeedbackReponseDTO): Observable<FeedbackDTO> {
    return this.http.put<FeedbackDTO>(`${this.api}/${id}/repondre`, reponse)
      .pipe(catchError(this.handleError));
  }

  // ── Admin : supprimer un feedback ────────────────────────────────────────
  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // ── Gestion centralisée des erreurs ──────────────────────────────────────
  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Erreur inconnue';
    if (error.status === 0) {
      message = 'Impossible de contacter le serveur.';
    } else if (error.status === 400) {
      const errs = error.error?.erreurs;
      message = errs
        ? Object.values(errs).join(' | ')
        : error.error?.erreur ?? 'Données invalides.';
    } else if (error.status === 401) {
      message = 'Non autorisé. Veuillez vous reconnecter.';
    } else if (error.status === 403) {
      message = "Accès refusé.";
    } else if (error.status === 404) {
      message = 'Feedback introuvable.';
    } else {
      message = error.error?.erreur ?? `Erreur serveur ${error.status}`;
    }
    console.error('[FeedbackService]', message, error);
    return throwError(() => new Error(message));
  }
}
