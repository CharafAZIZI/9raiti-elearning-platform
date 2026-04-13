import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-confirme',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center px-6 py-12 relative" style="background:var(--bg);">

      <!-- Background glow -->
      <div class="fixed inset-0 pointer-events-none" style="
        background:
          radial-gradient(ellipse 70% 50% at 50% 30%, rgba(16,185,129,.08) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 80% 80%, rgba(245,158,11,.04) 0%, transparent 60%);"></div>

      <!-- Auth grid -->
      <div class="fixed inset-0 pointer-events-none opacity-30" style="
        background-image: linear-gradient(var(--border) 1px, transparent 1px),
                          linear-gradient(90deg, var(--border) 1px, transparent 1px);
        background-size: 40px 40px;"></div>

      <div class="w-full max-w-[440px] relative z-10 animate-slide-up">

        <!-- Logo -->
        <div class="flex items-center gap-3 justify-center mb-8">
          <div class="w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-bold" style="
            background: linear-gradient(135deg,#F59E0B,#D97706);
            box-shadow: 0 8px 24px rgba(245,158,11,.35);
            color: white; font-family:'Syne',sans-serif;">9</div>
          <div>
            <div class="text-xl font-bold" style="color:var(--text);font-family:'Syne',sans-serif;">9raiti</div>
            <div class="text-xs font-bold uppercase tracking-[2.5px]" style="color:var(--brand);">E-Learning Platform</div>
          </div>
        </div>

        <!-- Card -->
        <div class="glass p-8 space-y-6 text-center" style="border:1px solid rgba(16,185,129,.2); box-shadow: 0 0 60px rgba(16,185,129,.06);">

          <!-- Icône animée -->
          <div class="flex justify-center animate-scale-in">
            <div class="relative">
              <div class="w-24 h-24 rounded-full flex items-center justify-center text-5xl" style="
                background: var(--green-dim);
                border: 2px solid var(--green);
                box-shadow: 0 0 50px rgba(16,185,129,.2);">
                ✅
              </div>
              <!-- Pulse ring -->
              <div class="absolute inset-0 rounded-full animate-ping" style="
                border: 2px solid var(--green);
                opacity: 0.2;"></div>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-xs font-bold uppercase tracking-[3px]" style="color:var(--green);">Vérification réussie</p>
            <h1 class="text-2xl font-bold" style="font-family:'Syne',sans-serif;color:var(--text);">
              Email confirmé !
            </h1>
            <p class="text-sm leading-relaxed" style="color:var(--text-2);">
              Votre adresse email a été vérifiée avec succès.<br>
              Votre compte est maintenant <strong style="color:var(--green);">activé</strong> et prêt à l'emploi.
            </p>
          </div>

          <!-- Étapes complétées -->
          <div class="space-y-2 text-left">
            <div *ngFor="let step of steps" class="flex items-center gap-3 px-4 py-2.5 rounded-xl" style="background:var(--surface-2);border:1px solid var(--border);">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style="background:var(--green-dim);border:1px solid var(--green);color:var(--green);">✓</div>
              <span class="text-sm" style="color:var(--text-2);">{{ step }}</span>
            </div>
          </div>

          <!-- Alert succès -->
          <div class="alert alert-green">
            <span>🎉</span>
            <span>Bienvenue sur 9raiti ! Vous pouvez maintenant accéder à toute la plateforme.</span>
          </div>

          <!-- Bouton connexion -->
          <a routerLink="/login" class="btn btn-brand w-full" style="
            text-decoration:none;display:flex;align-items:center;
            justify-content:center;gap:8px;padding:13px;font-size:14.5px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Se connecter maintenant
          </a>

          <a routerLink="/" class="block text-sm" style="color:var(--text-3);text-decoration:none;">
            ← Retour à l'accueil
          </a>
        </div>

      </div>
    </div>
  `
})
export class EmailConfirmeComponent {
  steps = [
    'Compte créé avec succès',
    'Email vérifié et validé',
    'Accès à la plateforme débloqué'
  ];
}
