import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, shareReplay, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CategorieDTO } from '../../models/categorie.model';
import { ModuleDTO } from '../../models/module.model';
import { CoursDTO } from '../../models/cours.model';

export interface PresignedUrlResponse {
  url: string;
  type: string;      // 'pdf' | 'video/mp4' | 'video/webm' | 'unknown'
  objectKey: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogueService {

  private readonly api = environment.apiUrl;

  // Cache simple pour éviter les appels répétés (lecture seule)
  private categories$?: Observable<CategorieDTO[]>;
  private modules$?: Observable<ModuleDTO[]>;
  private cours$?: Observable<CoursDTO[]>;

  constructor(private http: HttpClient) {}

  // ── CATÉGORIES ──────────────────────────────────────────────────────────────

  createCategorie(dto: CategorieDTO): Observable<CategorieDTO> {
    this.clearCache();
    return this.http.post<CategorieDTO>(`${this.api}/categories`, dto).pipe(catchError(this.handleError));
  }

  getAllCategories(): Observable<CategorieDTO[]> {
    if (!this.categories$) {
      this.categories$ = this.http.get<CategorieDTO[]>(`${this.api}/categories`)
        .pipe(shareReplay(1), catchError(this.handleError));
    }
    return this.categories$;
  }

  getCategorieById(id: number): Observable<CategorieDTO> {
    return this.http.get<CategorieDTO>(`${this.api}/categories/${id}`).pipe(catchError(this.handleError));
  }

  updateCategorie(id: number, dto: CategorieDTO): Observable<CategorieDTO> {
    this.clearCache();
    return this.http.put<CategorieDTO>(`${this.api}/categories/${id}`, dto).pipe(catchError(this.handleError));
  }

  deleteCategorie(id: number): Observable<void> {
    this.clearCache();
    return this.http.delete<void>(`${this.api}/categories/${id}`).pipe(catchError(this.handleError));
  }

  // ── MODULES ─────────────────────────────────────────────────────────────────

  createModule(dto: ModuleDTO): Observable<ModuleDTO> {
    this.clearCache();
    return this.http.post<ModuleDTO>(`${this.api}/modules`, dto).pipe(catchError(this.handleError));
  }

  getAllModules(): Observable<ModuleDTO[]> {
    if (!this.modules$) {
      this.modules$ = this.http.get<ModuleDTO[]>(`${this.api}/modules`)
        .pipe(shareReplay(1), catchError(this.handleError));
    }
    return this.modules$;
  }

  getModulesByCategorie(categorieId: number): Observable<ModuleDTO[]> {
    return this.http.get<ModuleDTO[]>(`${this.api}/modules/categorie/${categorieId}`).pipe(catchError(this.handleError));
  }

  /** Modules appartenant à l'enseignant connecté (dashboard enseignant) */
  getMesModules(): Observable<ModuleDTO[]> {
    return this.http.get<ModuleDTO[]>(`${this.api}/modules/mes-modules`).pipe(catchError(this.handleError));
  }

  getModuleById(id: number): Observable<ModuleDTO> {
    return this.http.get<ModuleDTO>(`${this.api}/modules/${id}`).pipe(catchError(this.handleError));
  }

  updateModule(id: number, dto: ModuleDTO): Observable<ModuleDTO> {
    this.clearCache();
    return this.http.put<ModuleDTO>(`${this.api}/modules/${id}`, dto).pipe(catchError(this.handleError));
  }

  deleteModule(id: number): Observable<void> {
    this.clearCache();
    return this.http.delete<void>(`${this.api}/modules/${id}`).pipe(catchError(this.handleError));
  }

  // ── COURS ────────────────────────────────────────────────────────────────────

  createCours(dto: CoursDTO): Observable<CoursDTO> {
    this.clearCache();
    return this.http.post<CoursDTO>(`${this.api}/cours`, dto).pipe(catchError(this.handleError));
  }

  getAllCours(): Observable<CoursDTO[]> {
    if (!this.cours$) {
      this.cours$ = this.http.get<CoursDTO[]>(`${this.api}/cours`)
        .pipe(shareReplay(1), catchError(this.handleError));
    }
    return this.cours$;
  }

  getCoursByModule(moduleId: number): Observable<CoursDTO[]> {
    return this.http.get<CoursDTO[]>(`${this.api}/cours/module/${moduleId}`).pipe(catchError(this.handleError));
  }

  /** Cours appartenant à l'enseignant connecté (dashboard enseignant) */
  getMesCours(): Observable<CoursDTO[]> {
    return this.http.get<CoursDTO[]>(`${this.api}/cours/mes-cours`).pipe(catchError(this.handleError));
  }

  getCoursPublies(): Observable<CoursDTO[]> {
    return this.http.get<CoursDTO[]>(`${this.api}/cours/publies`).pipe(catchError(this.handleError));
  }

  getCoursById(id: number): Observable<CoursDTO> {
    return this.http.get<CoursDTO>(`${this.api}/cours/${id}`).pipe(catchError(this.handleError));
  }

  updateCours(id: number, dto: CoursDTO): Observable<CoursDTO> {
    this.clearCache();
    return this.http.put<CoursDTO>(`${this.api}/cours/${id}`, dto).pipe(catchError(this.handleError));
  }

  deleteCours(id: number): Observable<void> {
    this.clearCache();
    return this.http.delete<void>(`${this.api}/cours/${id}`).pipe(catchError(this.handleError));
  }

  /**
   * Upload un fichier (PDF ou vidéo) pour un cours.
   * POST /api/cours/{id}/upload  –  multipart/form-data, champ "file"
   */
  uploadCoursFile(id: number, file: File): Observable<{ objectKey: string; message: string }> {
    this.clearCache();
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<{ objectKey: string; message: string }>(
      `${this.api}/cours/${id}/upload`, fd
    ).pipe(catchError(this.handleError));
  }

  /**
   * Récupère une URL pré-signée valable 15 min pour lire un fichier.
   * GET /api/cours/{id}/presigned-url
   * Utiliser cette URL directement dans <iframe src> ou <video src>.
   */
  getPresignedUrl(id: number): Observable<PresignedUrlResponse> {
    return this.http.get<PresignedUrlResponse>(`${this.api}/cours/${id}/presigned-url`)
      .pipe(catchError(this.handleError));
  }

  /** Vide le cache (après toute opération d'écriture) */
  clearCache(): void {
    this.categories$ = undefined;
    this.modules$ = undefined;
    this.cours$ = undefined;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Erreur inconnue';
    if (error.status === 0) {
      message = 'Impossible de contacter le serveur Spring Boot.';
    } else if (error.status === 401) {
      message = 'Non autorisé. Veuillez vous reconnecter.';
    } else if (error.status === 403) {
      message = "Accès refusé. Vous n'avez pas les droits nécessaires.";
    } else if (error.status === 404) {
      message = `Ressource introuvable : ${error.url}`;
    } else if (error.error?.message) {
      message = error.error.message;
    } else {
      message = `Erreur serveur ${error.status}`;
    }
    console.error('[CatalogueService]', message, error);
    return throwError(() => new Error(message));
  }
}
