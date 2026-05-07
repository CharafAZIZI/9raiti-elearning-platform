import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { TokenService } from '../../../core/services/token.service';
import { UserStateService } from '../../../core/services/user-state.service';
import { ThemeService } from '../../../core/services/theme.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit, OnDestroy {
  email         = '';
  role          = '';
  initials      = '?';
  displayName   = '';
  logoutLoading = false;
  isDark        = true;

  private subs: Subscription[] = [];

  constructor(
    private tokenService:     TokenService,
    private userStateService: UserStateService,
    private themeService:     ThemeService,
    private router:           Router,
    private http:             HttpClient
  ) {}

  ngOnInit(): void {
    // ✅ Fix 1 : chargement immédiat depuis localStorage sans attendre user$
    this.loadFromToken();

    // ✅ Fix 2 : mise à jour dès que user$ émet une valeur non-null
    this.subs.push(
      this.userStateService.user$.subscribe(user => {
        if (user) {
          this.email       = user.email  ?? this.email;
          this.role        = user.role   ?? this.role;
          this.displayName = this.userStateService.getDisplayName();
          this.computeInitials(user);
        } else {
          // user null = pas connecté, on relit quand même le token
          this.loadFromToken();
        }
      })
    );

    this.subs.push(
      this.themeService.theme$.subscribe(t => this.isDark = t === 'dark')
    );
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  // ✅ Lit directement localStorage/token sans passer par user$
  private loadFromToken(): void {
    const user = this.tokenService.getUser();
    if (user) {
      this.email       = user.email  ?? '';
      this.role        = user.role   ?? '';
      this.displayName = this.tokenService.getDisplayName();
      this.computeInitials(user);
    }
  }

  toggleTheme(): void { this.themeService.toggle(); }
  navigateToProfile(): void { this.router.navigate(['/profil']); }

  getDashboardRoute(): string {
    const r = this.role?.toLowerCase();
    if (r === 'apprenant')  return '/dashboard-apprenant';
    if (r === 'enseignant') return '/dashboard-enseignant';
    if (r === 'admin')      return '/dashboard-admin';
    return '/home';
  }

  getRoleBadgeClass(): string {
    const r = this.role?.toLowerCase();
    if (r === 'admin')      return 'b-purple';
    if (r === 'enseignant') return 'b-green';
    if (r === 'apprenant')  return 'b-blue';
    return 'b-brand';
  }

  getRoleLabel(): string {
    const r = this.role?.toLowerCase();
    if (r === 'admin')      return 'Administrateur';
    if (r === 'enseignant') return 'Enseignant';
    if (r === 'apprenant')  return 'Apprenant';
    return this.role;
  }

  private computeInitials(user: any): void {
    if (user?.prenom && user?.nom) {
      this.initials = (user.prenom[0] + user.nom[0]).toUpperCase();
    } else if (user?.prenom) {
      this.initials = user.prenom.substring(0, 2).toUpperCase();
    } else if (user?.displayName) {
      const parts = user.displayName.trim().split(' ');
      this.initials = parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : user.displayName.substring(0, 2).toUpperCase();
    } else if (user?.email) {
      this.initials = user.email.substring(0, 2).toUpperCase();
    } else {
      this.initials = '?';
    }
  }

  logout(): void {
    this.logoutLoading = true;
    const token   = this.tokenService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.post(
      `${environment.apiUrl}/auth/logout`, {},
      { headers, responseType: 'text' as const }
    ).subscribe({
      next:  () => { this.userStateService.clearUser(); this.router.navigate(['/login']); },
      error: () => { this.userStateService.clearUser(); this.router.navigate(['/login']); }
    });
  }
}