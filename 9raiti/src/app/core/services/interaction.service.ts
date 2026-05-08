import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CommentaireDTO, LikeDTO, NoteDTO, InteractionCoursDTO } from '../../models/interaction.model';

@Injectable({ providedIn: 'root' })
export class InteractionService {

  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Résumé global interactions d'un cours ───────────────────────────────────

  getInteractions(coursId: number): Observable<InteractionCoursDTO> {
    return this.http.get<InteractionCoursDTO>(`${this.api}/interactions/cours/${coursId}`)
      .pipe(catchError(this.handleError));
  }

  // ── Likes ────────────────────────────────────────────────────────────────────

  toggleLike(coursId: number): Observable<LikeDTO> {
    return this.http.post<LikeDTO>(`${this.api}/interactions/cours/${coursId}/like`, {})
      .pipe(catchError(this.handleError));
  }

  // ── Notes ────────────────────────────────────────────────────────────────────

  noterCours(coursId: number, note: number): Observable<NoteDTO> {
    return this.http.post<NoteDTO>(`${this.api}/interactions/cours/${coursId}/note`, { note })
      .pipe(catchError(this.handleError));
  }

  // ── Commentaires ─────────────────────────────────────────────────────────────

  getCommentaires(coursId: number): Observable<CommentaireDTO[]> {
    return this.http.get<CommentaireDTO[]>(`${this.api}/interactions/cours/${coursId}/commentaires`)
      .pipe(catchError(this.handleError));
  }

  ajouterCommentaire(dto: CommentaireDTO): Observable<CommentaireDTO> {
    return this.http.post<CommentaireDTO>(`${this.api}/interactions/cours/${dto.coursId}/commentaires`, dto)
      .pipe(catchError(this.handleError));
  }

  supprimerCommentaire(coursId: number, commentaireId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/interactions/cours/${coursId}/commentaires/${commentaireId}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(err: any): Observable<never> {
    console.error('[InteractionService]', err);
    return throwError(() => err);
  }
}
