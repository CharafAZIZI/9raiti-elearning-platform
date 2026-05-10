import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationType } from '../../../models/notification.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css']
})
export class NotificationBellComponent implements OnInit, OnDestroy {

  isOpen = false;

  notifs$    = this.notifSvc.notifs$;
  unread$    = this.notifSvc.unread$;
  connected$ = this.notifSvc.connected$;

  constructor(private notifSvc: NotificationService) {}

  ngOnInit(): void {}
  ngOnDestroy(): void {}

  togglePanel(): void { this.isOpen = !this.isOpen; }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!(e.target as HTMLElement).closest('app-notification-bell')) {
      this.isOpen = false;
    }
  }

  markAllRead(): void { this.notifSvc.markAllAsRead(); }
  clearAll(): void    { this.notifSvc.clearAll(); }
  read(id: string): void   { this.notifSvc.markAsRead(id); }
  remove(id: string): void { this.notifSvc.remove(id); }

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
