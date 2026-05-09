import { Component, OnInit, AfterViewInit , NgZone  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TokenService } from '../../core/services/token.service';
import { UserStateService } from '../../core/services/user-state.service';
import { environment } from '../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  loading = false;
  googleLoading = false;
  errorMessage = '';
  showPassword = false;
  googleReady = false;
  accessDeniedMessage = '';
  private returnUrl = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenService: TokenService,
    private userStateService: UserStateService,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone
  ) {
    this.form = this.fb.group({
      email:        ['', [Validators.required, Validators.email]],
      mot_de_passe: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '';
    const reason   = this.route.snapshot.queryParamMap.get('reason')    ?? '';
    if (reason === 'cours_protected') {
      this.accessDeniedMessage = '🔒 Accès non autorisé. Veuillez vous connecter pour accéder aux cours.';
    } else if (reason === 'auth_required') {
      this.accessDeniedMessage = '🔒 Connexion requise pour accéder à cette page.';
    }
    this.loadGoogleScript();
  }

  ngAfterViewInit(): void {}

  loadGoogleScript(): void {
    const existing = document.getElementById('google-gsi-script');
    if (existing) { this.initGoogle(); return; }
    const script = document.createElement('script');
    script.id    = 'google-gsi-script';
    script.src   = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => this.initGoogle();
    document.head.appendChild(script);
  }

  initGoogle(): void {
    const tryInit = () => {
      const btnEl = document.getElementById('google-btn');
      if (typeof google !== 'undefined' && btnEl) {
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          //  Enveloppez le callback dans NgZone
          callback: (response: any) => this.ngZone.run(() => this.handleGoogleResponse(response))
        });
        google.accounts.id.renderButton(btnEl, {
          theme: 'outline', size: 'large',
          width: btnEl.offsetWidth || 380,
          text: 'continue_with', locale: 'fr'
        });
        this.googleReady = true;
      } else { setTimeout(tryInit, 150); }
    };
    tryInit();
  }

  private decodeJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64    = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const json      = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(json);
    } catch { return null; }
  }

  handleGoogleResponse(response: any): void {
    this.googleLoading = true;
    this.errorMessage  = '';
    const googlePayload   = this.decodeJwt(response.credential);
    const googleEmail     = googlePayload?.email       ?? '';
    const googleName      = googlePayload?.name        ?? '';
    const googleFirstName = googlePayload?.given_name  ?? '';
    const googleFamily    = googlePayload?.family_name ?? '';

    this.authService.loginWithGoogle(response.credential).subscribe({
      next: (res: any) => {
        const token       = res.token      ?? res.Token      ?? '';
        const role        = res.role       ?? res.Role       ?? 'apprenant';
        const expiration  = res.expiration ?? res.Expiration ?? new Date(Date.now() + 86400000).toISOString();
        const email       = googleEmail     || res.email  || res.Email  || '';
        const prenom      = googleFirstName || res.prenom || res.Prenom || '';
        const nom         = googleFamily    || res.nom    || res.Nom    || '';
        const displayName = googleName      || res.name   || res.Name   || '';
        if (!token) { this.googleLoading = false; this.errorMessage = 'Réponse API invalide : token manquant.'; return; }
        this.tokenService.setToken(token);
        this.userStateService.updateUser({ email, role, expiration, nom, prenom, displayName });
        this.userStateService.loadProfileFromBackend().subscribe({
          next:  () => { this.googleLoading = false; this._redirectAfterLogin(role); },
          error: () => { this.googleLoading = false; this._redirectAfterLogin(role); }
        });
      },
      error: (err) => {
        this.googleLoading = false;
        if (err.status === 403) this.errorMessage = "Compte non autorisé. Contactez l'administrateur.";
        else                    this.errorMessage = 'Connexion Google échouée.';
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMessage = '';
    this.authService.login(this.form.value).subscribe({
      next: (res: any) => {
        this.loading = false;
        const token       = res.token      ?? res.Token      ?? '';
        const email       = res.email      ?? res.Email      ?? '';
        const role        = res.role       ?? res.Role       ?? 'apprenant';
        const expiration  = res.expiration ?? res.Expiration ?? new Date(Date.now() + 86400000).toISOString();
        const nom         = res.nom        ?? res.Nom        ?? '';
        const prenom      = res.prenom     ?? res.Prenom     ?? '';
        const displayName = res.name       ?? res.Name       ?? '';
        this.tokenService.setToken(token);
        this.userStateService.updateUser({ email, role, expiration, nom, prenom, displayName });
        this._redirectAfterLogin(role);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 403)      this.errorMessage = "Votre compte est en attente de validation par un administrateur.";
        else if (err.status === 401) this.errorMessage = 'Email ou mot de passe incorrect.';
        else                         this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
      }
    });
  }

  private _redirectAfterLogin(role: string): void {
    if (this.returnUrl && this.returnUrl !== '/login') { this.router.navigateByUrl(this.returnUrl); return; }
    const r = role?.toLowerCase();
    if (r === 'apprenant')       this.router.navigate(['/dashboard-apprenant']);
    else if (r === 'enseignant') this.router.navigate(['/dashboard-enseignant']);
    else if (r === 'admin')      this.router.navigate(['/dashboard-admin']);
    else                         this.router.navigate(['/home']);
  }

  get email()        { return this.form.get('email'); }
  get mot_de_passe() { return this.form.get('mot_de_passe'); }
}
