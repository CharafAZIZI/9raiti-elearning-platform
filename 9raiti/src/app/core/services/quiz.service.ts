import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import {
  QuizDTO,
  QuestionDTO,
  SoumettreQuizDTO,
  TentativeQuizDTO
} from '../../models/quiz.model';

@Injectable({ providedIn: 'root' })
export class QuizService {

  private readonly api    = `${environment.apiUrl}/quiz`;
  private readonly aiApi  = `${environment.apiUrl}/quiz-ai`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  // ── QUIZ CRUD (Enseignant) ────────────────────────────────────────────────

  creerQuiz(dto: QuizDTO): Observable<QuizDTO> {
    return this.http.post<QuizDTO>(`${this.api}`, dto).pipe(catchError(this.handleError));
  }

  getMesQuiz(): Observable<QuizDTO[]> {
    return this.http.get<QuizDTO[]>(`${this.api}/mes-quiz`).pipe(catchError(this.handleError));
  }

  getQuizById(id: number): Observable<QuizDTO> {
    return this.http.get<QuizDTO>(`${this.api}/${id}`).pipe(catchError(this.handleError));
  }

  getQuizParCours(coursId: number): Observable<QuizDTO[]> {
    return this.http.get<QuizDTO[]>(`${this.api}/cours/${coursId}`).pipe(catchError(this.handleError));
  }

  mettreAJourQuiz(id: number, dto: QuizDTO): Observable<QuizDTO> {
    return this.http.put<QuizDTO>(`${this.api}/${id}`, dto).pipe(catchError(this.handleError));
  }

  supprimerQuiz(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(catchError(this.handleError));
  }

  // ── QUESTIONS ────────────────────────────────────────────────────────────

  ajouterQuestion(quizId: number, dto: QuestionDTO): Observable<QuestionDTO> {
    return this.http.post<QuestionDTO>(`${this.api}/${quizId}/questions`, dto).pipe(catchError(this.handleError));
  }

  mettreAJourQuestion(questionId: number, dto: QuestionDTO): Observable<QuestionDTO> {
    return this.http.put<QuestionDTO>(`${this.api}/questions/${questionId}`, dto).pipe(catchError(this.handleError));
  }

  supprimerQuestion(questionId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/questions/${questionId}`).pipe(catchError(this.handleError));
  }

  // ── TENTATIVES (Apprenant) ───────────────────────────────────────────────

  soumettreQuiz(dto: SoumettreQuizDTO): Observable<TentativeQuizDTO> {
    return this.http.post<TentativeQuizDTO>(`${this.api}/soumettre`, dto).pipe(catchError(this.handleError));
  }

  getMesTentatives(): Observable<TentativeQuizDTO[]> {
    return this.http.get<TentativeQuizDTO[]>(`${this.api}/mes-tentatives`).pipe(catchError(this.handleError));
  }

  getTentativeById(id: number): Observable<TentativeQuizDTO> {
    return this.http.get<TentativeQuizDTO>(`${this.api}/tentatives/${id}`).pipe(catchError(this.handleError));
  }

  getTentativesParQuiz(quizId: number): Observable<TentativeQuizDTO[]> {
    return this.http.get<TentativeQuizDTO[]>(`${this.api}/${quizId}/tentatives`).pipe(catchError(this.handleError));
  }

  // ── QUIZ DISPONIBLES (Apprenant) ─────────────────────────────────────────

  getQuizDisponiblesParCours(coursId: number): Observable<QuizDTO[]> {
    return this.http.get<QuizDTO[]>(`${this.api}/cours/${coursId}/disponibles`).pipe(catchError(this.handleError));
  }

  // ── GÉNÉRATION IA ────────────────────────────────────────────────────────

  genererQuizParIA(
    file: File,
    coursId: number,
    nombreQuestions: number = 5,
    difficulte: 'FACILE' | 'MOYEN' | 'DIFFICILE' = 'MOYEN',
    typeQuestions: 'QCM' | 'VRAI_FAUX' | 'MIXTE' = 'QCM',
    config?: {
      titre?: string;
      description?: string;
      correctionInstantanee?: boolean;
      tempsLimiteMinutes?: number;
      randomiserQuestions?: boolean;
      randomiserReponses?: boolean;
    }
  ): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('coursId', coursId.toString());
    formData.append('nombreQuestions', nombreQuestions.toString());
    formData.append('difficulte', difficulte);
    formData.append('typeQuestions', typeQuestions);

    if (config) {
      if (config.titre)
        formData.append('titre', config.titre);
      if (config.description)
        formData.append('description', config.description);
      if (config.correctionInstantanee !== undefined)
        formData.append('correctionInstantanee', String(config.correctionInstantanee));
      if (config.tempsLimiteMinutes)
        formData.append('tempsLimiteMinutes', config.tempsLimiteMinutes.toString());
      if (config.randomiserQuestions !== undefined)
        formData.append('randomiserQuestions', String(config.randomiserQuestions));
      if (config.randomiserReponses !== undefined)
        formData.append('randomiserReponses', String(config.randomiserReponses));
    }

    // ✅ Token depuis auth_token (TokenService)
    const token = this.tokenService.getToken() ?? '';
    const headers = new HttpHeaders({
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });

    // ✅ Appel direct — bypass Ocelot (pas de timeout 503)
    return this.http.post(`${this.aiApi}/generate`, formData, { headers })
      .pipe(catchError(this.handleError));
  }

  // ── Gestion erreurs ──────────────────────────────────────────────────────

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Erreur inconnue';
    if (error.status === 0) {
      message = 'Impossible de contacter le serveur.';
    } else if (error.status === 401) {
      message = 'Non autorisé. Veuillez vous reconnecter.';
    } else if (error.status === 403) {
      message = 'Accès refusé.';
    } else if (error.status === 404) {
      message = 'Ressource introuvable.';
    } else if (error.error?.message) {
      message = error.error.message;
    } else {
      message = `Erreur serveur ${error.status}`;
    }
    console.error('[QuizService]', message, error);
    return throwError(() => new Error(message));
  }
}