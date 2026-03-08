import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: string;
  est_valide: boolean;
  est_actif: boolean;
  mot_de_passe?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  validerEnseignant(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/valider/${id}`, {});
  }

  activer(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/activer/${id}`, {});
  }

  suspendre(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/blocker/${id}`, {});
  }
}
