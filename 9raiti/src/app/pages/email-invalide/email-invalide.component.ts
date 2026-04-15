import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-invalide',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center px-6 py-12 relative" style="background:var(--bg);">

      <div class="fixed inset-0 pointer-events-none" style="
        background:
          radial-gradient(ellipse 70% 50% at 50% 30%, rgba(239,68,68,.06) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 20% 80%, rgba(245,158,11,.03) 0%, transparent 60%);"></div>

      <div class="fixed inset-0 pointer-events-none opacity-20" style="
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
        <div class="glass p-8 space-y-6 text-center" style="border:1px solid rgba(239,68,68,.15); box-shadow:0 0 60px rgba(239,68,68,.04);">

          <!-- Icône erreur -->
          <div class="flex justify-center animate-scale-in">
            <div class="w-24 h-24 rounded-full flex items-center justify-center text-5xl" style="
              background: var(--red-dim);
              border: 2px solid var(--red);
              box-shadow: 0 0 40px rgba(239,68,68,.12);">❌</div>
          </div>

          <div class="space-y-2">
            <p class="text-xs font-bold uppercase tracking-[3px]" style="color:var(--red);">Lien invalide</p>
            <h1 class="text-2xl font-bold" style="font-family:'Syne',sans-serif;color:var(--text);">
              Token expiré ou invalide
            </h1>
            <p class="text-sm leading-relaxed" style="color:var(--text-2);">
              Ce lien de confirmation n'est plus valide.<br>
              Il a peut-être <strong style="color:var(--text);">expiré (24h)</strong> ou déjà été utilisé.
            </p>
          </div>

          <!-- Raisons possibles -->
          <div class="space-y-2 text-left">
            <p class="text-xs font-semibold uppercase tracking-wider mb-3" style="color:var(--text-3);">Causes possibles</p>
            <div *ngFor="let reason of reasons" class="flex items-start gap-3 px-4 py-2.5 rounded-xl" style="background:var(--surface-2);border:1px solid var(--border);">
              <span class="flex-shrink-0 mt-0.5">{{ reason.icon }}</span>
              <span class="text-sm" style="color:var(--text-2);">{{ reason.text }}</span>
            </div>
          </div>

          <div class="alert alert-red">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="flex-shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>Veuillez créer un nouveau compte pour recevoir un nouveau lien.</span>
          </div>

          <!-- Boutons -->
          <div class="space-y-3">
            <a routerLink="/register" class="btn btn-brand w-full" style="
              text-decoration:none;display:flex;align-items:center;
              justify-content:center;gap:8px;padding:13px;font-size:14.5px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              Créer un nouveau compte
            </a>
            <a routerLink="/" class="btn btn-ghost w-full" style="text-decoration:none;display:flex;align-items:center;justify-content:center;">
              ← Retour à l'accueil
            </a>
          </div>
        </div>

      </div>
    </div>
  `
})
export class EmailInvalideComponent {
  reasons = [
    { icon: '⏰', text: 'Le lien a expiré (validité : 24 heures)' },
    { icon: '🔗', text: 'Le lien a déjà été utilisé une fois' },
    { icon: '✂️', text: 'Le lien a été tronqué dans votre email' },
  ];
}
