import { Injectable } from '@angular/core';

export interface StoredUser {
  email: string;
  role: string;
  expiration: string;
  nom?: string;
  prenom?: string;
  displayName?: string;
}

@Injectable({ providedIn: 'root' })
export class TokenService {

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY  = 'auth_user';

  setToken(token: string): void { localStorage.setItem(this.TOKEN_KEY, token); }
  getToken(): string | null     { return localStorage.getItem(this.TOKEN_KEY); }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  setUser(user: StoredUser): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): StoredUser | null {
    const u = localStorage.getItem(this.USER_KEY);
    return u ? JSON.parse(u) : null;
  }

  getRole(): string | null { return this.getUser()?.role ?? null; }

  /**
   * Extrait l'ID de l'enseignant connecté depuis le claim NameIdentifier du JWT .NET.
   * ClaimTypes.NameIdentifier = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
   */
  getEnseignantId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    const payload = this.decodeJwt(token);
    if (!payload) return null;
    const raw =
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ??
      payload['nameid'] ??
      payload['sub'] ??
      null;
    if (raw === null) return null;
    const id = Number(raw);
    return isNaN(id) ? null : id;
  }

  private decodeJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64).split('').map(c =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      );
      return JSON.parse(json);
    } catch { return null; }
  }

  getDisplayName(): string {
    const user = this.getUser();

    // 1. prenom + nom
    if (user?.prenom && user?.nom)  return `${user.prenom} ${user.nom}`;
    if (user?.prenom)               return user.prenom;
    if (user?.nom)                  return user.nom;
    if (user?.displayName)          return user.displayName;

    // 2. Décoder le JWT de l'API pour trouver un claim name
    const token = this.getToken();
    if (token) {
      const p = this.decodeJwt(token);
      if (p) {
        const name =
          p['name']        ??
          p['given_name']  ??
          p['unique_name'] ??
          p['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ??
          p['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] ??
          null;
        if (name) return name;

        // email depuis JWT
        const jwtEmail =
          p['email'] ??
          p['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ??
          null;
        if (jwtEmail) return (jwtEmail as string).split('@')[0];
      }
    }

    // 3. email stocké
    if (user?.email) return user.email.split('@')[0];

    return 'Utilisateur';
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const user = this.getUser();
    if (!user) return false;
    // Si expiration vide ou invalide, considère comme connecté si token existe
    if (!user.expiration) return true;
    return new Date(user.expiration) > new Date();
  }
}
