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
      <div class="nc-toolbar">
        <div class="flex items-center gap-2">
          <span class="nc-count" *ngIf="(notifSvc.unread$ | async)! > 0">{{ notifSvc.unread$ | async }} non lues</span>
          <span class="nc-dot" [class.connected]="notifSvc.connected$ | async"
                [title]="(notifSvc.connected$ | async) ? 'Temps réel actif' : 'Reconnexion...'"></span>
        </div>
        <div class="flex gap-2">
          <button class="nc-btn" *ngIf="(notifSvc.unread$ | async)! > 0" (click)="notifSvc.markAllAsRead()">Tout marquer lu</button>
          <button class="nc-btn danger" *ngIf="(notifSvc.notifs$ | async)!.length > 0" (click)="notifSvc.clearAll()">Tout effacer</button>
        </div>
      </div>

      <div class="nc-list">
        <div *ngIf="(notifSvc.notifs$ | async)!.length === 0" class="nc-empty">
          <div style="font-size:2.5rem;opacity:.2;margin-bottom:10px;">🔔</div>
          <p>Aucune notification</p>
          <p style="font-size:11px;margin-top:4px;opacity:.6;">Les nouvelles notifications apparaîtront ici en temps réel</p>
        </div>

        <div *ngFor="let n of (notifSvc.notifs$ | async)" class="nc-item" [class.unread]="!n.lue" (click)="notifSvc.markAsRead(n.id)">
          <div class="nc-icon" [style.background]="getIconBg(n.type)">{{ getIcon(n.type) }}</div>
          <div class="nc-body">
            <p class="nc-msg">{{ n.message }}</p>
            <p class="nc-time">{{ n.timestamp | date:'HH:mm · dd/MM/yyyy' }}</p>
          </div>
          <div *ngIf="!n.lue" class="nc-unread-dot"></div>
          <button class="nc-del" (click)="notifSvc.remove(n.id); $event.stopPropagation()">×</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nc-card { border:1.5px solid var(--border); border-radius:20px; background:var(--card); overflow:hidden; }
    .nc-toolbar { display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px solid var(--border); background:var(--surface); }
    .nc-count { font-size:11px; font-weight:700; background:var(--brand-dim); color:var(--brand); padding:2px 8px; border-radius:20px; }
    .nc-dot { width:8px;height:8px;border-radius:50%;background:#ef4444;transition:background .3s;flex-shrink:0; }
    .nc-dot.connected { background:#22c55e; }
    .nc-btn { font-size:11px; color:var(--text-3); background:none; border:none; cursor:pointer; padding:3px 8px; border-radius:7px; transition:all .15s; }
    .nc-btn:hover { background:var(--hover); color:var(--text); }
    .nc-btn.danger:hover { background:rgba(239,68,68,.1); color:#ef4444; }
    .nc-list { max-height:450px; overflow-y:auto; padding:8px; }
    .nc-empty { padding:48px 16px; text-align:center; color:var(--text-3); font-size:13px; }
    .nc-item { display:flex; align-items:flex-start; gap:10px; padding:12px 10px; border-radius:12px; cursor:pointer; transition:background .15s; border:1px solid transparent; }
    .nc-item:hover { background:var(--hover); }
    .nc-item.unread { background:var(--brand-dim); border-color:rgba(245,158,11,.15); }
    .nc-icon { width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0; }
    .nc-body { flex:1; min-width:0; }
    .nc-msg { font-size:13px; color:var(--text); line-height:1.45; word-break:break-word; margin:0 0 3px; }
    .nc-time { font-size:11px; color:var(--text-3); margin:0; }
    .nc-unread-dot { width:8px;height:8px;border-radius:50%;background:var(--brand);flex-shrink:0;margin-top:5px; }
    .nc-del { background:none;border:none;color:var(--text-3);font-size:16px;cursor:pointer;padding:2px 4px;border-radius:5px;opacity:0;transition:opacity .15s;flex-shrink:0; }
    .nc-item:hover .nc-del { opacity:1; }
    .nc-del:hover { background:rgba(239,68,68,.1);color:#ef4444; }
  `]
})
export class NotificationCenterComponent {
  @Input() role = '';
  constructor(public notifSvc: NotificationService) {}

  getIcon(type: string): string {
    const m: Record<string,string> = {
      COURS_CREE:'📘',COURS_PUBLIE:'✅',COURS_ARCHIVE:'📦',COURS_SUPPRIME:'🗑️',
      MODULE_CREE:'📁',INSCRIPTION_CREE:'🎓',INSCRIPTION_SUPPRIMEE:'❌',
      USER_VALIDE:'✅',USER_REJETE:'🚫',USER_CREE:'👤',
      INTERACTION_LIKE:'👍',INTERACTION_COMMENTAIRE:'💬',INTERACTION_NOTE:'⭐',
      MAINTENANCE:'🔧',ALERTE:'⚠️',MISE_A_JOUR:'🚀',INFO:'🔔',
    };
    return m[type] ?? '🔔';
  }

  getIconBg(type: string): string {
    if (['COURS_SUPPRIME','MODULE_SUPPRIME','CATEGORIE_SUPPRIME','INSCRIPTION_SUPPRIMEE','USER_REJETE'].includes(type)) return 'rgba(239,68,68,.15)';
    if (['COURS_PUBLIE','USER_VALIDE','INSCRIPTION_CREE'].includes(type)) return 'rgba(34,197,94,.15)';
    if (['INTERACTION_LIKE','INTERACTION_COMMENTAIRE','INTERACTION_NOTE'].includes(type)) return 'rgba(168,85,247,.15)';
    if (['MAINTENANCE','ALERTE'].includes(type)) return 'rgba(239,68,68,.12)';
    return 'rgba(245,158,11,.15)';
  }
}
