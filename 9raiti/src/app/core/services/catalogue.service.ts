import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, shareReplay, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CategorieDTO } from '../../models/categorie.model';
import { ModuleDTO }    from '../../models/module.model';
import { CoursDTO }     from '../../models/cours.model';

@Injectable({ providedIn: 'root' })
export class CatalogueService {

  // Spring Boot API — routée via /spring-api → http://localhost:8080/api
  private readonly api = environment.springApiUrl;

  // Cache simple pour éviter les appels répétés (lecture seule)
  private categories$?: Observable<CategorieDTO[]>;
  private modules$?: Observable<ModuleDTO[]>;
  private cours$?: Observable<CoursDTO[]>;

  constructor(private http: HttpClient) {}

  // ════════════════════════════════════════════════════════
  // CATÉGORIES  →  CategoriesController.java
  // ════════════════════════════════════════════════════════

  createCategorie(dto: CategorieDTO): Observable<CategorieDTO> {
    this.clearCache();
    return this.http.post<CategorieDTO>(`${this.api}/categories`, dto)
      .pipe(catchError(this.handleError));
  }

  getAllCategories(): Observable<CategorieDTO[]> {
    if (!this.categories$) {
      this.categories$ = this.http.get<CategorieDTO[]>(`${this.api}/categories`)
        .pipe(shareReplay(1), catchError(this.handleError));
    }
    return this.categories$;
  }

  getCategorieById(id: number): Observable<CategorieDTO> {
    return this.http.get<CategorieDTO>(`${this.api}/categories/${id}`)
      .pipe(catchError(this.handleError));
  }

  updateCategorie(id: number, dto: CategorieDTO): Observable<CategorieDTO> {
    this.clearCache();
    return this.http.put<CategorieDTO>(`${this.api}/categories/${id}`, dto)
      .pipe(catchError(this.handleError));
  }

  deleteCategorie(id: number): Observable<void> {
    this.clearCache();
    return this.http.delete<void>(`${this.api}/categories/${id}`)
      .pipe(catchError(this.handleError));
  }

  // ════════════════════════════════════════════════════════
  // MODULES  →  ModuleController.java
  // ════════════════════════════════════════════════════════

  createModule(dto: ModuleDTO): Observable<ModuleDTO> {
    this.clearCache();
    return this.http.post<ModuleDTO>(`${this.api}/modules`, dto)
      .pipe(catchError(this.handleError));
  }

  getAllModules(): Observable<ModuleDTO[]> {
    if (!this.modules$) {
      this.modules$ = this.http.get<ModuleDTO[]>(`${this.api}/modules`)
        .pipe(shareReplay(1), catchError(this.handleError));
    }
    return this.modules$;
  }

  getModulesByCategorie(categorieId: number): Observable<ModuleDTO[]> {
    return this.http.get<ModuleDTO[]>(`${this.api}/modules/categorie/${categorieId}`)
      .pipe(catchError(this.handleError));
  }

  getModuleById(id: number): Observable<ModuleDTO> {
    return this.http.get<ModuleDTO>(`${this.api}/modules/${id}`)
      .pipe(catchError(this.handleError));
  }

  updateModule(id: number, dto: ModuleDTO): Observable<ModuleDTO> {
    this.clearCache();
    return this.http.put<ModuleDTO>(`${this.api}/modules/${id}`, dto)
      .pipe(catchError(this.handleError));
  }

  deleteModule(id: number): Observable<void> {
    this.clearCache();
    return this.http.delete<void>(`${this.api}/modules/${id}`)
      .pipe(catchError(this.handleError));
  }

  // ════════════════════════════════════════════════════════
  // COURS  →  CoursController.java
  // ════════════════════════════════════════════════════════

  createCours(dto: CoursDTO): Observable<CoursDTO> {
    this.clearCache();
    return this.http.post<CoursDTO>(`${this.api}/cours`, dto)
      .pipe(catchError(this.handleError));
  }

  getAllCours(): Observable<CoursDTO[]> {
    if (!this.cours$) {
      this.cours$ = this.http.get<CoursDTO[]>(`${this.api}/cours`)
        .pipe(shareReplay(1), catchError(this.handleError));
    }
    return this.cours$;
  }

  getCoursByModule(moduleId: number): Observable<CoursDTO[]> {
    return this.http.get<CoursDTO[]>(`${this.api}/cours/module/${moduleId}`)
      .pipe(catchError(this.handleError));
  }

  getCoursPublies(): Observable<CoursDTO[]> {
    return this.http.get<CoursDTO[]>(`${this.api}/cours/publies`)
      .pipe(catchError(this.handleError));
  }

  getCoursById(id: number): Observable<CoursDTO> {
    return this.http.get<CoursDTO>(`${this.api}/cours/${id}`)
      .pipe(catchError(this.handleError));
  }

  updateCours(id: number, dto: CoursDTO): Observable<CoursDTO> {
    this.clearCache();
    return this.http.put<CoursDTO>(`${this.api}/cours/${id}`, dto)
      .pipe(catchError(this.handleError));
  }

  deleteCours(id: number): Observable<void> {
    this.clearCache();
    return this.http.delete<void>(`${this.api}/cours/${id}`)
      .pipe(catchError(this.handleError));
  }

  /** POST /api/cours/{id}/upload — multipart/form-data avec champ "file" */
  uploadCoursFile(id: number, file: File): Observable<string> {
    this.clearCache();
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post(`${this.api}/cours/${id}/upload`, fd, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  /** GET /api/cours/{id}/download?mode=inline — retourne le PDF en bytes */
  getDownloadUrl(id: number, mode: 'inline' | 'attachment' = 'inline'): string {
    return `${this.api}/cours/${id}/download?mode=${mode}`;
  }

  /** Vide le cache (appelé automatiquement après toute opération d'écriture) */
  clearCache(): void {
    this.categories$ = undefined;
    this.modules$    = undefined;
    this.cours$      = undefined;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Erreur inconnue';
    if (error.status === 0) {
      message = 'Impossible de contacter le serveur Spring Boot. Vérifiez qu\'il est démarré sur le port 8080.';
    } else if (error.status === 401) {
      message = 'Non autorisé. Veuillez vous reconnecter.';
    } else if (error.status === 403) {
      message = 'Accès refusé. Vous n\'avez pas les droits nécessaires.';
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
