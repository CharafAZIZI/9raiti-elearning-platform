import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationBellComponent } from '../../shared/components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, DatePipe, NotificationBellComponent],
  template: `
    <div class="nc-card">

      <!-- Toolbar -->
      <div class="nc-toolbar">
        <div class="nc-toolbar-left">
          <span class="nc-count" *ngIf="(notifSvc.unread$ | async)! > 0">
            {{ notifSvc.unread$ | async }} non lue(s)
          </span>
          <div class="nc-status">
            <span class="nc-dot" [class.connected]="notifSvc.connected$ | async"></span>
            <span class="nc-status-label">
              {{ (notifSvc.connected$ | async) ? 'Temps réel actif' : 'Reconnexion...' }}
            </span>
          </div>
        </div>
        <div class="nc-toolbar-right">
          <button class="nc-btn"
                  *ngIf="(notifSvc.unread$ | async)! > 0"
                  (click)="notifSvc.markAllAsRead()">
            ✓ Tout marquer lu
          </button>
          <button class="nc-btn nc-btn-danger"
                  *ngIf="(notifSvc.notifs$ | async)!.length > 0"
                  (click)="notifSvc.clearAll()">
            🗑 Effacer tout
          </button>
        </div>
      </div>

      <!-- Liste -->
      <div class="nc-list">

        <!-- État vide -->
        <div *ngIf="(notifSvc.notifs$ | async)!.length === 0" class="nc-empty">
          <div class="nc-empty-icon">🔔</div>
          <p class="nc-empty-title">Aucune notification</p>
          <p class="nc-empty-sub">Les nouvelles notifications apparaîtront ici en temps réel</p>
        </div>

        <!-- Items -->
        <div *ngFor="let n of (notifSvc.notifs$ | async)"
             class="nc-item"
             [class.nc-item-unread]="!n.lue"
             (click)="notifSvc.markAsRead(n.id)">

          <!-- Icône -->
          <div class="nc-icon" [ngClass]="getIconClass(n.type)">
            {{ getIcon(n.type) }}
          </div>

          <!-- Contenu -->
          <div class="nc-body">
            <p class="nc-msg">{{ n.message }}</p>
            <p class="nc-time">{{ n.timestamp | date:'HH:mm · dd/MM/yyyy' }}</p>
          </div>

          <!-- Point non-lu -->
          <div *ngIf="!n.lue" class="nc-unread-dot"></div>

          <!-- Supprimer -->
          <button class="nc-del"
                  (click)="notifSvc.remove(n.id); $event.stopPropagation()"
                  title="Supprimer">×</button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* ═══════════════════════════════════════════════════════
       NotificationCenter — dark/light mode complet
       Utilise uniquement les variables CSS du thème global
    ═══════════════════════════════════════════════════════ */

    /* ── Carte principale ─────────────────────────────── */
    .nc-card {
      border: 1.5px solid var(--border);
      border-radius: 20px;
      background: var(--surface);
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,.08);
    }

    /* ── Toolbar ──────────────────────────────────────── */
    .nc-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
      padding: 14px 16px;
      border-bottom: 1px solid var(--border);
      background: var(--surface-2);
    }
    .nc-toolbar-left  { display: flex; align-items: center; gap: 10px; }
    .nc-toolbar-right { display: flex; align-items: center; gap: 6px; }

    /* Badge "non lues" */
    .nc-count {
      font-size: 11px;
      font-weight: 700;
      background: var(--brand-dim);
      color: var(--brand);
      padding: 3px 10px;
      border-radius: 999px;
      border: 1px solid var(--border-brand, var(--brand-dim));
      white-space: nowrap;
    }

    /* Indicateur connexion */
    .nc-status       { display: flex; align-items: center; gap: 5px; }
    .nc-status-label { font-size: 11px; color: var(--text-3); }
    .nc-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--red);
      flex-shrink: 0;
      transition: background .3s;
    }
    .nc-dot.connected { background: var(--green); }

    /* Boutons toolbar */
    .nc-btn {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-3);
      background: var(--surface);
      border: 1px solid var(--border);
      cursor: pointer;
      padding: 4px 10px;
      border-radius: 8px;
      transition: all .15s;
      white-space: nowrap;
    }
    .nc-btn:hover {
      background: var(--bg-3);
      color: var(--text);
      border-color: var(--brand);
    }
    .nc-btn-danger:hover {
      background: var(--red-dim);
      color: var(--red);
      border-color: var(--red);
    }

    /* ── Liste ────────────────────────────────────────── */
    .nc-list {
      max-height: 480px;
      overflow-y: auto;
      padding: 8px;
      background: var(--surface);
    }
    /* Scrollbar discrète */
    .nc-list::-webkit-scrollbar { width: 4px; }
    .nc-list::-webkit-scrollbar-track { background: transparent; }
    .nc-list::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 4px;
    }

    /* ── État vide ────────────────────────────────────── */
    .nc-empty {
      padding: 52px 16px;
      text-align: center;
    }
    .nc-empty-icon  { font-size: 2.5rem; opacity: .25; margin-bottom: 12px; }
    .nc-empty-title { font-size: 14px; font-weight: 600; color: var(--text-3); margin: 0 0 4px; }
    .nc-empty-sub   { font-size: 11px; color: var(--text-3); opacity: .7; margin: 0; }

    /* ── Item notification ────────────────────────────── */
    .nc-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 10px;
      border-radius: 12px;
      cursor: pointer;
      transition: background .15s;
      border: 1px solid transparent;
      margin-bottom: 2px;
    }
    .nc-item:hover {
      background: var(--bg-3);
      border-color: var(--border);
    }
    /* Non-lu : fond brand-dim + bordure légère */
    .nc-item-unread {
      background: var(--brand-dim);
      border-color: var(--border-brand, var(--brand-dim));
    }
    .nc-item-unread:hover {
      background: var(--brand-dim);
      filter: brightness(1.06);
    }

    /* ── Icône ────────────────────────────────────────── */
    .nc-icon {
      width: 40px; height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
      border: 1px solid transparent;
    }
    /* Classes couleur icône — utilisent les vars du thème */
    .icon-red    { background: var(--red-dim);    border-color: rgba(239,68,68,.2); }
    .icon-green  { background: var(--green-dim);  border-color: rgba(16,185,129,.2); }
    .icon-purple { background: var(--purple-dim); border-color: rgba(139,92,246,.2); }
    .icon-orange { background: var(--orange-dim); border-color: rgba(249,115,22,.2); }
    .icon-brand  { background: var(--brand-dim);  border-color: var(--border-brand, var(--brand-dim)); }
    .icon-blue   { background: var(--blue-dim);   border-color: rgba(59,130,246,.2); }

    /* ── Body ─────────────────────────────────────────── */
    .nc-body   { flex: 1; min-width: 0; }
    .nc-msg    { font-size: 13px; color: var(--text); line-height: 1.5; word-break: break-word; margin: 0 0 4px; font-weight: 500; }
    .nc-time   { font-size: 11px; color: var(--text-3); margin: 0; }

    /* Point non-lu */
    .nc-unread-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--brand);
      flex-shrink: 0;
      margin-top: 6px;
    }

    /* Bouton supprimer */
    .nc-del {
      background: none;
      border: none;
      color: var(--text-3);
      font-size: 18px;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 6px;
      opacity: 0;
      transition: opacity .15s, background .15s, color .15s;
      flex-shrink: 0;
      line-height: 1;
    }
    .nc-item:hover .nc-del { opacity: 1; }
    .nc-del:hover {
      background: var(--red-dim);
      color: var(--red);
    }
  `]
})
export class NotificationCenterComponent {
  @Input() role = '';
  constructor(public notifSvc: NotificationService) {}

  getIcon(type: string): string {
    const m: Record<string, string> = {
      COURS_CREE:              '📘',
      COURS_PUBLIE:            '✅',
      COURS_ARCHIVE:           '📦',
      COURS_SUPPRIME:          '🗑️',
      MODULE_CREE:             '📁',
      MODULE_SUPPRIME:         '🗑️',
      CATEGORIE_CREE:          '📂',
      CATEGORIE_SUPPRIME:      '🗑️',
      INSCRIPTION_CREE:        '🎓',
      INSCRIPTION_SUPPRIMEE:   '❌',
      USER_VALIDE:             '✅',
      USER_REJETE:             '🚫',
      USER_CREE:               '👤',
      INTERACTION_LIKE:        '👍',
      INTERACTION_COMMENTAIRE: '💬',
      INTERACTION_NOTE:        '⭐',
      MAINTENANCE:             '🔧',
      ALERTE:                  '⚠️',
      MISE_A_JOUR:             '🚀',
      INFO:                    '🔔',
    };
    return m[type] ?? '🔔';
  }

  /** Retourne une classe CSS au lieu d'un rgba() hardcodé */
  getIconClass(type: string): string {
    if (['COURS_SUPPRIME','MODULE_SUPPRIME','CATEGORIE_SUPPRIME',
         'INSCRIPTION_SUPPRIMEE','USER_REJETE'].includes(type)) return 'icon-red';

    if (['COURS_PUBLIE','USER_VALIDE','INSCRIPTION_CREE',
         'COURS_CREE','MODULE_CREE','CATEGORIE_CREE'].includes(type)) return 'icon-green';

    if (['INTERACTION_LIKE','INTERACTION_COMMENTAIRE',
         'INTERACTION_NOTE'].includes(type)) return 'icon-purple';

    if (['MAINTENANCE','ALERTE'].includes(type)) return 'icon-orange';

    if (['MISE_A_JOUR'].includes(type)) return 'icon-blue';

    if (['USER_CREE'].includes(type)) return 'icon-brand';

    return 'icon-brand';
  }
}
