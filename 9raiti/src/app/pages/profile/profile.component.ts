import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule,
  AbstractControl, ValidationErrors
} from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { TokenService } from '../../core/services/token.service';
import { UserStateService } from '../../core/services/user-state.service';
import { ProfileService, ProfileResponse, UpdateProfileUserVM } from '../../core/services/profile.service';

// Validator: mot_de_passe === confirmation_mot_de_passe (uniquement si un mot de passe est saisi)
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pwd  = group.get('mot_de_passe')?.value;
  const conf = group.get('confirmation_mot_de_passe');
  if (pwd && conf?.value && pwd !== conf.value) {
    conf.setErrors({ mismatch: true });
    return { mismatch: true };
  }
  if (conf?.errors?.['mismatch']) conf.setErrors(null);
  return null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  // ── Active tab ──────────────────────────────────────────────────────────────
  activeTab: 'info' | 'password' | 'role-details' = 'info';

  // ── Forms ───────────────────────────────────────────────────────────────────
  infoForm!: FormGroup;
  passwordForm!: FormGroup;
  detailsForm!: FormGroup;

  // ── Loading / feedback ──────────────────────────────────────────────────────
  pageLoading   = true;
  loadingInfo   = false;
  loadingPwd    = false;
  loadingDetails= false;

  successInfo   = ''; errorInfo   = '';
  successPwd    = ''; errorPwd    = '';
  successDetails= ''; errorDetails= '';

  // ── Password visibility ─────────────────────────────────────────────────────
  showOld = false; showNew = false; showConf = false;

  // ── User display ────────────────────────────────────────────────────────────
  displayName = '';
  email       = '';
  role        = '';        // "APPRENANT" | "ENSEIGNANT" | "ADMIN"
  initials    = '?';
  profile: ProfileResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private tokenService: TokenService,
    private userState: UserStateService,
    private profileService: ProfileService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.userState.getUser();
    if (!user) { this.router.navigate(['/login']); return; }

    this.email       = user.email   ?? '';
    this.role        = (user.role   ?? '').toUpperCase();
    this.displayName = this.userState.getDisplayName();
    this.initials    = this.computeInitials(user);

    this.buildForms();

    // FIX PAGE BLANCHE GOOGLE: souscrit au BehaviorSubject user$
    this.userState.user$.subscribe(u => {
      if (u) {
        this.displayName = this.userState.getDisplayName();
        this.initials    = this.computeInitials(u);
        this.cdr.detectChanges();
      }
    });

    this.loadProfile();
  }

  // ── Build forms ─────────────────────────────────────────────────────────────
  private buildForms(): void {
    this.infoForm = this.fb.group({
      prenom:    ['', [Validators.required, Validators.minLength(2)]],
      nom:       ['', [Validators.required, Validators.minLength(2)]],
      email:     ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.pattern(/^[0-9+\s\-]{0,15}$/)]],
    });

    // Mot de passe — tous optionnels, mais si on remplit l'un on valide l'ensemble
    this.passwordForm = this.fb.group({
      mot_de_passe:              ['', [Validators.required, Validators.minLength(6)]],
      confirmation_mot_de_passe: ['', [Validators.required]],
    }, { validators: passwordMatchValidator });

    // Détails selon le rôle
    this.detailsForm = this.fb.group({
      // APPRENANT
      niveau_scolaire: [''],
      statut:          [''],
      score:           [null, [Validators.min(0), Validators.max(20)]],
      // ENSEIGNANT
      specialite:      [''],
    });
  }

  // ── Load profile from API ───────────────────────────────────────────────────
  private loadProfile(): void {
    this.pageLoading = true;
    this.profileService.getMyProfile().subscribe({
      next: (p) => {
        this.profile = p;
        this.role    = (p.role ?? this.role).toUpperCase();
        this.email   = p.email ?? this.email;

        // Pre-fill info form
        this.infoForm.patchValue({
          prenom:    p.prenom    ?? '',
          nom:       p.nom       ?? '',
          email:     p.email     ?? '',
          telephone: p.telephone ?? '',
        });

        // Pre-fill details form
        if (p.details) {
          this.detailsForm.patchValue({
            niveau_scolaire: p.details.niveau_scolaire ?? '',
            statut:          p.details.statut          ?? '',
            score:           p.details.score           ?? null,
            specialite:      p.details.specialite      ?? '',
          });
        }

        this.pageLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        // Fallback : utiliser les données du localStorage
        const user = this.userState.getUser();
        if (user) {
          this.infoForm.patchValue({ prenom: user.prenom ?? '', nom: user.nom ?? '', email: user.email ?? '' });
        }
        this.pageLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Submit info ─────────────────────────────────────────────────────────────
  submitInfo(): void {
    if (this.infoForm.invalid) { this.infoForm.markAllAsTouched(); return; }
    this.loadingInfo  = true;
    this.successInfo  = ''; this.errorInfo = '';

    const vm: UpdateProfileUserVM = {
      prenom:    this.infoForm.value.prenom    || undefined,
      nom:       this.infoForm.value.nom       || undefined,
      email:     this.infoForm.value.email     || undefined,
      telephone: this.infoForm.value.telephone || undefined,
    };

    this.profileService.updateMyProfile(vm).subscribe({
      next: (res) => {
        this.loadingInfo = false;
        this.successInfo = '✓ Profil mis à jour avec succès !';
        this.profile = res;
        // ✅ Met à jour le BehaviorSubject → Navbar + partout sans refresh
        const current = this.userState.getUser();
        if (current) {
          this.userState.updateUser({
            ...current,
            prenom: res.prenom ?? vm.prenom ?? current.prenom,
            nom:    res.nom    ?? vm.nom    ?? current.nom,
            email:  res.email  ?? vm.email  ?? current.email,
          });
          this.displayName = this.userState.getDisplayName();
          this.initials    = this.computeInitials({ ...current, ...vm });
        }
        setTimeout(() => { this.successInfo = ''; this.cdr.detectChanges(); }, 4000);
      },
      error: (err) => {
        this.loadingInfo = false;
        if (err.status === 409) this.errorInfo = 'Cette adresse email est déjà utilisée.';
        else this.errorInfo = err.error?.message ?? 'Erreur lors de la mise à jour.';
      }
    });
  }

  // ── Submit password ─────────────────────────────────────────────────────────
  // Backend : même endpoint PUT /api/profile avec mot_de_passe + confirmation
  submitPassword(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    this.loadingPwd  = true;
    this.successPwd  = ''; this.errorPwd = '';

    const vm: UpdateProfileUserVM = {
      mot_de_passe:              this.passwordForm.value.mot_de_passe,
      confirmation_mot_de_passe: this.passwordForm.value.confirmation_mot_de_passe,
    };

    this.profileService.updateMyProfile(vm).subscribe({
      next: () => {
        this.loadingPwd  = false;
        this.successPwd  = '✓ Mot de passe modifié avec succès !';
        this.passwordForm.reset();
        setTimeout(() => { this.successPwd = ''; this.cdr.detectChanges(); }, 4000);
      },
      error: (err) => {
        this.loadingPwd = false;
        if (err.status === 400) this.errorPwd = 'Vérifiez que les deux mots de passe correspondent.';
        else this.errorPwd = err.error?.message ?? 'Erreur lors du changement de mot de passe.';
      }
    });
  }

  // ── Submit role details ─────────────────────────────────────────────────────
  submitDetails(): void {
    this.loadingDetails  = true;
    this.successDetails  = ''; this.errorDetails = '';

    const v = this.detailsForm.value;
    const vm: UpdateProfileUserVM = this.role === 'APPRENANT'
      ? {
          niveau_scolaire: v.niveau_scolaire || undefined,
          statut:          v.statut          || undefined,
          score:           v.score != null   ? +v.score : undefined,
        }
      : {
          specialite: v.specialite || undefined,
        };

    this.profileService.updateMyProfile(vm).subscribe({
      next: (res) => {
        this.loadingDetails  = false;
        this.successDetails  = '✓ Informations spécialisées mises à jour !';
        if (res.details) {
          this.detailsForm.patchValue({
            niveau_scolaire: res.details.niveau_scolaire ?? '',
            statut:          res.details.statut          ?? '',
            score:           res.details.score           ?? null,
            specialite:      res.details.specialite      ?? '',
          });
        }
        setTimeout(() => { this.successDetails = ''; this.cdr.detectChanges(); }, 4000);
      },
      error: (err) => {
        this.loadingDetails = false;
        this.errorDetails = err.error?.message ?? 'Erreur lors de la mise à jour.';
      }
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  private computeInitials(user: any): string {
    if (user?.prenom && user?.nom) return (user.prenom[0] + user.nom[0]).toUpperCase();
    if (user?.displayName) {
      const p = user.displayName.trim().split(' ');
      return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : user.displayName.substring(0, 2).toUpperCase();
    }
    if (user?.email) return user.email.substring(0, 2).toUpperCase();
    return '?';
  }

  get pwdStrength(): { w: string; c: string; l: string } {
    const p = this.passwordForm.get('mot_de_passe')?.value ?? '';
    if (!p) return { w: '0%', c: 'var(--border)', l: '' };
    if (p.length < 6) return { w: '25%', c: 'var(--error-color)', l: 'Faible' };
    if (p.length < 8) return { w: '50%', c: 'var(--warning-color)', l: 'Moyen' };
    const strong = /[A-Z]/.test(p) && /[0-9]/.test(p) && /[^a-zA-Z0-9]/.test(p);
    if (strong) return { w: '100%', c: 'var(--success-color)', l: 'Très fort' };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { w: '80%', c: 'var(--success-color)', l: 'Fort' };
    return { w: '60%', c: '#60a5fa', l: 'Bien' };
  }

  get isApprenant():  boolean { return this.role === 'APPRENANT'; }
  get isEnseignant(): boolean { return this.role === 'ENSEIGNANT'; }
  get hasRoleDetails(): boolean { return this.isApprenant || this.isEnseignant; }

  goBack(): void {
    const r = this.role.toLowerCase();
    if (r === 'admin')      this.router.navigate(['/dashboard-admin']);
    else if (r === 'enseignant') this.router.navigate(['/dashboard-enseignant']);
    else                    this.router.navigate(['/dashboard-apprenant']);
  }

  // Form getters for template
  get prenom()    { return this.infoForm.get('prenom'); }
  get nom()       { return this.infoForm.get('nom'); }
  get emailCtrl() { return this.infoForm.get('email'); }
  get telephone() { return this.infoForm.get('telephone'); }
  get pwdNew()    { return this.passwordForm.get('mot_de_passe'); }
  get pwdConf()   { return this.passwordForm.get('confirmation_mot_de_passe'); }
}
