import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ─── DTOs alignés avec UpdateProfileUserVM du backend ───────────────────────
export interface UpdateProfileUserVM {
  email?:                     string;
  mot_de_passe?:              string;
  confirmation_mot_de_passe?: string;
  telephone?:                 string;
  nom?:                       string;
  prenom?:                    string;
  // Apprenant
  niveau_scolaire?:           string;
  statut?:                    string;
  score?:                     number | null;
  // Enseignant
  specialite?:                string;
}

// ─── Réponse de GetMyProfile ─────────────────────────────────────────────────
export interface ProfileResponse {
  id:         number;
  email:      string;
  nom:        string;
  prenom:     string;
  role:       string;
  telephone:  string | null;
  est_actif:  boolean;
  est_valide: boolean;
  details?: {
    // Apprenant
    niveau_scolaire?: string;
    statut?:          string;
    score?:           number;
    // Enseignant
    specialite?:      string;
    date_embauche?:   string;
  };
}

@Injectable({ providedIn: 'root' })
export class ProfileService {

  private readonly base = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  /** GET /api/profile → GetMyProfile */
  getMyProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(this.base);
  }

  /** PUT /api/profile → UpdateUser */
  updateMyProfile(vm: UpdateProfileUserVM): Observable<ProfileResponse> {
    return this.http.put<ProfileResponse>(this.base, vm);
  }
}
