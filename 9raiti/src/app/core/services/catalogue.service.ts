import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategorieDTO } from '../../models/categorie.model';
import { ModuleDTO } from '../../models/module.model';
import { CoursDTO } from '../../models/cours.model';

@Injectable({ providedIn: 'root' })
export class CatalogueService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Catégories ──────────────────────────────────────────
  getAllCategories(): Observable<CategorieDTO[]> {
    return this.http.get<CategorieDTO[]>(`${this.api}/categories`);
  }

  getCategorieById(id: number): Observable<CategorieDTO> {
    return this.http.get<CategorieDTO>(`${this.api}/categories/${id}`);
  }

  // ── Modules ─────────────────────────────────────────────
  getAllModules(): Observable<ModuleDTO[]> {
    return this.http.get<ModuleDTO[]>(`${this.api}/modules`);
  }

  getModuleById(id: number): Observable<ModuleDTO> {
    return this.http.get<ModuleDTO>(`${this.api}/modules/${id}`);
  }

  // ── Cours ────────────────────────────────────────────────
  getAllCours(): Observable<CoursDTO[]> {
    return this.http.get<CoursDTO[]>(`${this.api}/cours`);
  }

  getCoursById(id: number): Observable<CoursDTO> {
    return this.http.get<CoursDTO>(`${this.api}/cours/${id}`);
  }
}
