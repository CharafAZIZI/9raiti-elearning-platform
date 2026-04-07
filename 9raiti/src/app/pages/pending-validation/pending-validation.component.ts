import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../../core/services/token.service';
import { UserStateService } from '../../core/services/user-state.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pending-validation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-validation.component.html',
  styleUrls: ['./pending-validation.component.css']
})
export class PendingValidationComponent {

  steps = [
    { label: 'Compte créé avec succès', done: true,  active: false, icon: '' },
    { label: "Examen par l'administration", done: false, active: true,  icon: '' },
    { label: 'Notification par email',    done: false, active: false, icon: '📬' },
    { label: 'Accès complet à votre espace', done: false, active: false, icon: '🎉' },
  ];

  constructor(
    private tokenService: TokenService,
    private userStateService: UserStateService,
    private router: Router,
    private http: HttpClient
  ) {}

  logout(): void {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.post(`${environment.apiUrl}/auth/logout`, {}, { headers, responseType: 'text' as const }).subscribe({
      next: () => { this.userStateService.clearUser(); this.router.navigate(['/login']); },
      error: () => { this.userStateService.clearUser(); this.router.navigate(['/login']); }
    });
  }
}
