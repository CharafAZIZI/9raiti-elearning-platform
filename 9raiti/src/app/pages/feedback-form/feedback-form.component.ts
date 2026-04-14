// src/app/shared/components/feedback-form/feedback-form.component.ts

import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FeedbackService } from '../../core/services/feedback.service';
import { TokenService } from '../../core/services/token.service';
import {
  FeedbackDTO,
  TypeAvis,
  TYPE_AVIS_LABELS
} from '../../models/feedback.model';

@Component({
  selector: 'app-feedback-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './feedback-form.component.html'
})
export class FeedbackFormComponent implements OnInit {

  /** Si fourni, le champ email est pré-rempli et verrouillé */
  @Input() prefillEmail: string | null = null;

  /** Si fourni (dashboard enseignant/apprenant), lié à un cours précis */
  @Input() coursId: number | null = null;

  /** Événement émis à la soumission réussie */
  @Output() submitted = new EventEmitter<void>();

  /** Événement émis pour fermer un modal parent */
  @Output() closed = new EventEmitter<void>();

  form!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  readonly typesAvis: { value: TypeAvis; label: string }[] = Object.entries(TYPE_AVIS_LABELS).map(
    ([value, label]) => ({ value: value as TypeAvis, label })
  );

  get isAuthenticated(): boolean {
    return this.tokenService.isLoggedIn();
  }

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: [
        this.prefillEmail ?? '',
        [Validators.required, Validators.email]
      ],
      typeAvis: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]]
    });

    // Si email pré-rempli → désactiver le champ (l'utilisateur ne peut pas le modifier)
    if (this.prefillEmail) {
      this.form.get('email')?.disable();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const rawValue = this.form.getRawValue(); // getRawValue() inclut les champs disabled
    const dto: FeedbackDTO = {
      email:    rawValue.email,
      typeAvis: rawValue.typeAvis,
      message:  rawValue.message,
      coursId:  this.coursId ?? null
    };

    const request$ = this.isAuthenticated
      ? this.feedbackService.soumettreAuthentifie(dto)
      : this.feedbackService.soumettreAnonyme(dto);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Votre avis a bien été envoyé. Merci !';
        this.form.reset();
        if (this.prefillEmail) {
          this.form.get('email')?.setValue(this.prefillEmail);
        }
        this.submitted.emit();
      },
      error: (err: Error) => {
        this.loading = false;
        this.errorMessage = err.message;
      }
    });
  }

  onClose(): void {
    this.closed.emit();
  }

  // Helpers template
  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required']) return 'Ce champ est obligatoire.';
    if (ctrl.errors['email'])    return 'Email invalide.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} caractères.`;
    if (ctrl.errors['maxlength']) return `Maximum ${ctrl.errors['maxlength'].requiredLength} caractères.`;
    return 'Valeur invalide.';
  }
}
