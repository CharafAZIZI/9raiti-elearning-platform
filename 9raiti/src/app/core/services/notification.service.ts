import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { TokenService } from './token.service';
import { NotificationDTO } from '../../models/notification.model';
import { environment } from '../../../environments/environment';

export interface BroadcastMessage {
  message: string;
  type: 'INFO' | 'MAINTENANCE' | 'ALERTE' | 'MISE_A_JOUR';
}

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {

  private eventSource: EventSource | null = null;
  private readonly MAX_NOTIFS = 100;
  private reconnectTimer: any;
  private reconnectDelay = 5000;

  private notifsSubject    = new BehaviorSubject<NotificationDTO[]>([]);
  private unreadSubject    = new BehaviorSubject<number>(0);
  private toastSubject     = new Subject<NotificationDTO>();
  private connectedSubject = new BehaviorSubject<boolean>(false);

  notifs$    = this.notifsSubject.asObservable();
  unread$    = this.unreadSubject.asObservable();
  toast$     = this.toastSubject.asObservable();
  connected$ = this.connectedSubject.asObservable();

  constructor(
    private tokenService: TokenService,
    private http: HttpClient
  ) {}

  connect(): void {
    if (this.eventSource) return;
    const token = this.tokenService.getToken();
    if (!token) return;
    if (!this.tokenService.isLoggedIn()) return;

    const url = `${environment.notificationUrl}/notifications/stream?token=${encodeURIComponent(token)}`;
    try {
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        this.reconnectDelay = 5000;
        this.connectedSubject.next(true);
      };

      this.eventSource.onmessage = (e) => {
        try { this.addNotification(JSON.parse(e.data)); } catch {}
      };

      this.eventSource.addEventListener('notification', (e: MessageEvent) => {
        try { this.addNotification(JSON.parse(e.data)); } catch {}
      });

      this.eventSource.onerror = () => {
        this.connectedSubject.next(false);
        this.eventSource?.close();
        this.eventSource = null;
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          this.reconnectDelay = Math.min(this.reconnectDelay * 2, 60000);
          this.connect();
        }, this.reconnectDelay);
      };
    } catch (e) {
      console.error('[NotificationService]', e);
    }
  }

  disconnect(): void {
    if (this.eventSource) { this.eventSource.close(); this.eventSource = null; }
    clearTimeout(this.reconnectTimer);
    this.connectedSubject.next(false);
  }

  // ── Actions locales + API ────────────────────────────────────────────────────

  markAsRead(id: string): void {
    const notifs = this.notifsSubject.value.map(n => n.id === id ? { ...n, lue: true } : n);
    this.notifsSubject.next(notifs);
    this.refreshUnread(notifs);
  }

  markAllAsRead(): void {
    const notifs = this.notifsSubject.value.map(n => ({ ...n, lue: true }));
    this.notifsSubject.next(notifs);
    this.unreadSubject.next(0);
  }

  /** Supprimer une notification — met à jour la DB puis le state local */
  remove(id: string): void {
    this.http.delete(`${environment.apiUrl}/notifications/${id}`).subscribe({
      next: () => {
        const notifs = this.notifsSubject.value.filter(n => n.id !== id);
        this.notifsSubject.next(notifs);
        this.refreshUnread(notifs);
      },
      error: (err) => {
        console.error('[NotificationService] Erreur suppression notification', err);
        // Supprimer quand même localement pour ne pas bloquer l'UX
        const notifs = this.notifsSubject.value.filter(n => n.id !== id);
        this.notifsSubject.next(notifs);
        this.refreshUnread(notifs);
      }
    });
  }

  /** Supprimer toutes les notifications — met à jour la DB puis le state local */
  clearAll(): void {
    this.http.delete(`${environment.apiUrl}/notifications/me`).subscribe({
      next: () => {
        this.notifsSubject.next([]);
        this.unreadSubject.next(0);
      },
      error: (err) => {
        console.error('[NotificationService] Erreur suppression toutes notifications', err);
        // Vider quand même localement
        this.notifsSubject.next([]);
        this.unreadSubject.next(0);
      }
    });
  }

  // ── API calls ────────────────────────────────────────────────────────────────

  /** Admin: envoyer une notification broadcast à tous les utilisateurs */
  broadcast(msg: BroadcastMessage): Observable<any> {
    return this.http.post(`${environment.apiUrl}/notifications/broadcast`, msg);
  }

  /** Admin: envoyer une notification à un rôle spécifique */
  notifyRole(role: string, msg: BroadcastMessage): Observable<any> {
    return this.http.post(`${environment.apiUrl}/notifications/broadcast/role/${role}`, msg);
  }

  // ── Privé ────────────────────────────────────────────────────────────────────

  private addNotification(notif: NotificationDTO): void {
    const current = this.notifsSubject.value;
    if (current.some(n => n.id === notif.id)) return;
    const updated = [notif, ...current].slice(0, this.MAX_NOTIFS);
    this.notifsSubject.next(updated);
    this.refreshUnread(updated);
    if (!notif.lue) this.toastSubject.next(notif);
  }

  private refreshUnread(notifs: NotificationDTO[]): void {
    this.unreadSubject.next(notifs.filter(n => !n.lue).length);
  }

  ngOnDestroy(): void { this.disconnect(); }
}