import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { TokenService } from '../../../core/services/token.service';
import { UserStateService } from '../../../core/services/user-state.service';
import { ThemeService } from '../../../core/services/theme.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit, OnDestroy {
  email = '';
  role = '';
  initials = '?';
  displayName = '';
  logoutLoading = false;
  isDark = true;

  private subs: Subscription[] = [];

  constructor(
    private tokenService: TokenService,
    private userStateService: UserStateService,
    private themeService: ThemeService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Subscribe to user state (fixes Google Login refresh bug)
    this.subs.push(
      this.userStateService.user$.subscribe(user => {
        if (user) {
          this.email       = user.email ?? '';
          this.role        = user.role  ?? '';
          this.displayName = this.userStateService.getDisplayName();
          this.computeInitials(user);
        }
      })
    );
    // Subscribe to theme state
    this.subs.push(
      this.themeService.theme$.subscribe(t => this.isDark = t === 'dark')
    );
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  toggleTheme(): void { this.themeService.toggle(); }

  navigateToProfile(): void { this.router.navigate(['/profil']); }

  private computeInitials(user: any): void {
    if (user.prenom && user.nom) {
      this.initials = (user.prenom[0] + user.nom[0]).toUpperCase();
    } else if (user.prenom) {
      this.initials = user.prenom.substring(0, 2).toUpperCase();
    } else if (user.displayName) {
      const parts = user.displayName.trim().split(' ');
      this.initials = parts.length >= 2
        ? (parts[0][0] + parts[parts.length-1][0]).toUpperCase()
        : user.displayName.substring(0, 2).toUpperCase();
    } else if (user.email) {
      this.initials = user.email.substring(0, 2).toUpperCase();
    }
  }

  logout(): void {
    this.logoutLoading = true;
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.post(`${environment.apiUrl}/auth/logout`, {}, { headers, responseType: 'text' as const }).subscribe({
      next:  () => { this.userStateService.clearUser(); this.router.navigate(['/login']); },
      error: () => { this.userStateService.clearUser(); this.router.navigate(['/login']); }
    });
  }
}
