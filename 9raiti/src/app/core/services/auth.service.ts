import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../../models/login.model';
import { RegisterUserVM } from '../../models/register.model';
import { ForgotPasswordRequest, ResetPasswordRequest } from '../../models/password.model';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  register(vm: RegisterUserVM): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth`, vm, { responseType: 'text' });
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, request);
  }

  loginWithGoogle(idToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/google-login`, { IdToken: idToken });
  }

  logout(): Observable<any> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, { headers, responseType: 'text' });
  }

  // ── Mot de passe oublié ──────────────────────────────────
  forgotPassword(req: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot`, req, { responseType: 'text' });
  }

  resetPassword(req: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset`, req);
  }

  isLoggedIn(): boolean {
    return this.tokenService.isLoggedIn();
  }

  getRole(): string | null {
    return this.tokenService.getRole();
  }
}
