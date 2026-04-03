import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

type Etape = 'form' | 'succes' | 'token-invalide';

// Validateur personnalisé : les 2 mots de passe doivent correspondre
function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pwd = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pwd && confirm && pwd !== confirm ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  form: FormGroup;
  loading = false;
  errorMsg = '';
  etape: Etape = 'form';
  token = '';

  showNew = false;
  showConfirm = false;

  // Force du mot de passe
  get forceScore(): number {
    const pwd: string = this.form.get('newPassword')?.value ?? '';
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8)            score++;
    if (/[A-Z]/.test(pwd))          score++;
    if (/[0-9]/.test(pwd))          score++;
    if (/[^A-Za-z0-9]/.test(pwd))   score++;
    return score;
  }

  get forceLabel(): string {
    return ['', 'Faible', 'Moyen', 'Bon', 'Fort'][this.forceScore];
  }

  get forceColor(): string {
    return ['', 'var(--red)', 'var(--orange)', 'var(--brand)', 'var(--green)'][this.forceScore];
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      newPassword:     ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordsMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.etape = 'token-invalide';
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading = true;
    this.errorMsg = '';

    this.authService.resetPassword({
      token:           this.token,
      newPassword:     this.form.value.newPassword,
      confirmPassword: this.form.value.confirmPassword
    }).subscribe({
      next: () => {
        this.loading = false;
        this.etape = 'succes';
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 400) {
          this.errorMsg = err.error?.message ?? 'Token invalide ou expiré.';
          this.etape = 'token-invalide';
        } else {
          this.errorMsg = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }

  get newPassword()     { return this.form.get('newPassword'); }
  get confirmPassword() { return this.form.get('confirmPassword'); }
}
