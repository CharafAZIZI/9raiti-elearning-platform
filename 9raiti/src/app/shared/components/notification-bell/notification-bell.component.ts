import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationDTO, NotificationType } from '../../../models/notification.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css']
})
export class NotificationBellComponent implements OnInit, OnDestroy {

  isOpen = false;
  currentToast: NotificationDTO | null = null;
  private toastTimer: any;
  private subs: Subscription[] = [];

  notifs$    = this.notifSvc.notifs$;
  unread$    = this.notifSvc.unread$;
  connected$ = this.notifSvc.connected$;

  constructor(private notifSvc: NotificationService) {}

  ngOnInit(): void {
    this.subs.push(this.notifSvc.toast$.subscribe(n => this.showToast(n)));
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    clearTimeout(this.toastTimer);
  }

  togglePanel(): void { this.isOpen = !this.isOpen; }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!(e.target as HTMLElement).closest('app-notification-bell')) this.isOpen = false;
  }

  markAllRead(): void  { this.notifSvc.markAllAsRead(); }
  clearAll(): void     { this.notifSvc.clearAll(); }
  read(id: string): void  { this.notifSvc.markAsRead(id); }
  remove(id: string): void { this.notifSvc.remove(id); }
  dismissToast(): void { this.currentToast = null; clearTimeout(this.toastTimer); }

  private showToast(n: NotificationDTO): void {
    this.currentToast = n;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.currentToast = null, 5000);
  }

  getIcon(type: NotificationType): string {
    const map: Record<string, string> = {
      COURS_CREE: '📘', COURS_PUBLIE: '✅', COURS_ARCHIVE: '📦', COURS_SUPPRIME: '🗑️',
      MODULE_CREE: '📁', MODULE_SUPPRIME: '🗑️',
      CATEGORIE_CREE: '📂', CATEGORIE_SUPPRIME: '🗑️',
      INSCRIPTION_CREE: '🎓', INSCRIPTION_SUPPRIMEE: '❌',
      USER_VALIDE: '✅', USER_REJETE: '🚫', USER_CREE: '👤',
      INTERACTION_LIKE: '👍', INTERACTION_COMMENTAIRE: '💬', INTERACTION_NOTE: '⭐',
      MAINTENANCE: '🔧', ALERTE: '⚠️', MISE_A_JOUR: '🚀', INFO: '🔔',
    };
    return map[type] ?? '🔔';
  }

  getIconBg(type: NotificationType): string {
    if (['COURS_SUPPRIME','MODULE_SUPPRIME','CATEGORIE_SUPPRIME','INSCRIPTION_SUPPRIMEE','USER_REJETE'].includes(type))
      return 'rgba(239,68,68,.15)';
    if (['COURS_PUBLIE','USER_VALIDE','INSCRIPTION_CREE'].includes(type))
      return 'rgba(34,197,94,.15)';
    if (['INTERACTION_LIKE','INTERACTION_COMMENTAIRE','INTERACTION_NOTE'].includes(type))
      return 'rgba(168,85,247,.15)';
    if (['MAINTENANCE','ALERTE'].includes(type))
      return 'rgba(239,68,68,.12)';
    if (['MISE_A_JOUR'].includes(type))
      return 'rgba(59,130,246,.15)';
    return 'rgba(245,158,11,.15)';
  }
}
