import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationDTO, NotificationType } from '../../../models/notification.model';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-wrap" *ngIf="currentToast">
      <div class="toast-card">
        <div class="toast-icon" [ngClass]="getIconClass(currentToast.type)">
          {{ getIcon(currentToast.type) }}
        </div>
        <p class="toast-msg">{{ currentToast.message }}</p>
        <button class="toast-close" (click)="dismiss()">×</button>
      </div>
    </div>
  `,
  styles: [`
    /* Toast global — position fixe par rapport au viewport */
    .toast-wrap {
      position: fixed;
      bottom: 32px;
      right: 28px;
      z-index: 9999;
      max-width: 360px;
      min-width: 280px;
      pointer-events: none;
    }
    .toast-card {
      pointer-events: all;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: var(--surface);
      border: 1.5px solid var(--border-2);
      border-radius: 18px;
      box-shadow: 0 20px 60px rgba(0,0,0,.25), 0 4px 20px rgba(0,0,0,.1);
      animation: toastIn .3s cubic-bezier(.34,1.56,.64,1);
    }
    .toast-icon {
      width: 36px; height: 36px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; flex-shrink: 0;
    }
    .toast-msg {
      font-size: 13px;
      color: var(--text);
      margin: 0;
      line-height: 1.45;
      flex: 1;
      font-weight: 500;
    }
    .toast-close {
      background: none; border: none;
      color: var(--text-3);
      cursor: pointer; font-size: 18px;
      padding: 0 4px; border-radius: 6px;
      flex-shrink: 0;
      transition: color .15s, background .15s;
      line-height: 1;
    }
    .toast-close:hover { color: var(--text); background: var(--bg-3); }

    /* Couleurs icônes — adaptées dark/light via CSS vars */
    .nb-icon-red    { background: var(--red-dim); }
    .nb-icon-green  { background: var(--green-dim); }
    .nb-icon-purple { background: var(--purple-dim); }
    .nb-icon-orange { background: var(--orange-dim); }
    .nb-icon-blue   { background: var(--blue-dim); }
    .nb-icon-brand  { background: var(--brand-dim); }

    @keyframes toastIn {
      from { opacity: 0; transform: translateY(24px) scale(.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {

  currentToast: NotificationDTO | null = null;
  private toastTimer: any;
  private sub!: Subscription;

  constructor(private notifSvc: NotificationService) {}

  ngOnInit(): void {
    this.sub = this.notifSvc.toast$.subscribe(n => {
      this.currentToast = n;
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => this.currentToast = null, 5000);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    clearTimeout(this.toastTimer);
  }

  dismiss(): void {
    this.currentToast = null;
    clearTimeout(this.toastTimer);
  }

  getIcon(type: NotificationType | string): string {
    const map: Record<string, string> = {
      COURS_CREE:'📘', COURS_PUBLIE:'✅', COURS_ARCHIVE:'📦', COURS_SUPPRIME:'🗑️',
      MODULE_CREE:'📁', MODULE_SUPPRIME:'🗑️', CATEGORIE_CREE:'📂', CATEGORIE_SUPPRIME:'🗑️',
      INSCRIPTION_CREE:'🎓', INSCRIPTION_SUPPRIMEE:'❌',
      USER_VALIDE:'✅', USER_REJETE:'🚫', USER_CREE:'👤',
      INTERACTION_LIKE:'👍', INTERACTION_COMMENTAIRE:'💬', INTERACTION_NOTE:'⭐',
      MAINTENANCE:'🔧', ALERTE:'⚠️', MISE_A_JOUR:'🚀', INFO:'🔔',
    };
    return map[type] ?? '🔔';
  }

  getIconClass(type: NotificationType | string): string {
    if (['COURS_SUPPRIME','MODULE_SUPPRIME','CATEGORIE_SUPPRIME',
         'INSCRIPTION_SUPPRIMEE','USER_REJETE'].includes(type)) return 'nb-icon-red';
    if (['COURS_PUBLIE','USER_VALIDE','INSCRIPTION_CREE',
         'COURS_CREE','MODULE_CREE','CATEGORIE_CREE'].includes(type)) return 'nb-icon-green';
    if (['INTERACTION_LIKE','INTERACTION_COMMENTAIRE',
         'INTERACTION_NOTE'].includes(type)) return 'nb-icon-purple';
    if (['MAINTENANCE','ALERTE'].includes(type)) return 'nb-icon-orange';
    if (['MISE_A_JOUR'].includes(type)) return 'nb-icon-blue';
    return 'nb-icon-brand';
  }
}
