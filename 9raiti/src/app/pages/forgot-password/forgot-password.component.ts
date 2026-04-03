import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

type Etape = 'form' | 'succes';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  form: FormGroup;
  loading = false;
  errorMsg = '';
  etape: Etape = 'form';
  emailEnvoye = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading = true;
    this.errorMsg = '';
    const email = this.form.value.email;

    this.authService.forgotPassword({ email }).subscribe({
      next: () => {
        this.loading = false;
        this.emailEnvoye = email;
        this.etape = 'succes';
      },
      error: () => {
        this.loading = false;
        // L'API retourne toujours 200 pour ne pas révéler si l'email existe
        // Si on arrive ici c'est une vraie erreur réseau
        this.errorMsg = 'Une erreur est survenue. Veuillez réessayer.';
      }
    });
  }

  get email() { return this.form.get('email'); }
}
