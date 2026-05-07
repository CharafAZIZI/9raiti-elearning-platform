import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pwd = control.get('mot_de_passe');
  const confirm = control.get('confirmation_mot_de_passe');
  if (pwd && confirm && pwd.value !== confirm.value) {
    confirm.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  form: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.pattern(/^[0-9+\s\-]{8,15}$/)]],
      mot_de_passe: ['', [Validators.required, Validators.minLength(6)]],
      confirmation_mot_de_passe: ['', Validators.required],
      role: ['apprenant', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  get selectedRole(): string {
    return this.form.get('role')?.value || 'apprenant';
  }

  get passwordStrength(): { width: string; color: string; label: string } {
    const pwd = this.form.get('mot_de_passe')?.value || '';
    if (pwd.length === 0) return { width: '0%', color: '#dce8ef', label: '' };
    if (pwd.length < 6) return { width: '25%', color: '#c0392b', label: 'Faible' };
    if (pwd.length < 8) return { width: '50%', color: '#e8a020', label: 'Moyen' };
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return { width: '100%', color: '#2d7a4f', label: 'Fort' };
    return { width: '75%', color: '#2d8ab0', label: 'Bien' };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.form.value).subscribe({
      next: () => {
        this.loading = false;
        if (this.selectedRole === 'enseignant') {
          this.successMessage = 'Compte créé avec succès. Votre compte est en attente de validation par un administrateur.';
        } else {
          this.successMessage = 'Inscription réussie ! Vérifiez votre email pour activer votre compte.';          
        }
      },
      // error: (err) => {
      //   this.loading = false;
      //   if (err.status === 409) {
      //     this.errorMessage = 'Un compte avec cette adresse email existe déjà.';
      //   } else {
      //     this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
      //   }
      // }
      error: (err) => {
        this.loading = false;
        console.error('ERREUR INSCRIPTION:', err); // ✅ temporaire
        console.error('STATUS:', err.status);
        console.error('ERROR BODY:', err.error);
        
        if (err.status === 409) {
          this.errorMessage = 'Un compte avec cette adresse email existe déjà.';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }

  // Getters
  get nom() { return this.form.get('nom'); }
  get prenom() { return this.form.get('prenom'); }
  get email() { return this.form.get('email'); }
  get telephone() { return this.form.get('telephone'); }
  get mot_de_passe() { return this.form.get('mot_de_passe'); }
  get confirmation_mot_de_passe() { return this.form.get('confirmation_mot_de_passe'); }
}
