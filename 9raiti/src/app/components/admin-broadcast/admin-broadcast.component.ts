import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';

interface HistoriqueItem {
  message: string;
  type: string;
  cible: string;
  sentAt: Date;
}

@Component({
  selector: 'app-admin-broadcast',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './admin-broadcast.component.html',
  styleUrls: ['./admin-broadcast.component.css']
})
export class AdminBroadcastComponent {

  message  = '';
  msgType: 'INFO' | 'MAINTENANCE' | 'ALERTE' | 'MISE_A_JOUR' = 'INFO';
  cible: 'TOUS' | 'APPRENANTS' | 'ENSEIGNANTS' = 'TOUS';

  loading     = false;
  feedback    = '';
  feedbackErr = false;

  historique: HistoriqueItem[] = [];

  constructor(private notifSvc: NotificationService) {}

  envoyer(): void {
    const msg = this.message.trim();
    if (!msg || this.loading) return;
    this.loading = true;

    const payload = { message: msg, type: this.msgType, cible: this.cible };

    const obs$ = this.cible === 'TOUS'
      ? this.notifSvc.broadcast(payload)
      : this.notifSvc.notifyRole(
          this.cible === 'APPRENANTS' ? 'apprenant' : 'enseignant',
          payload
        );

    obs$.subscribe({
      next: () => {
        this.historique = [
          { message: msg, type: this.msgType, cible: this.getCibleLabel(), sentAt: new Date() },
          ...this.historique.slice(0, 9)
        ];
        this.message = '';
        this.loading = false;
        this.flash('✅ Notification envoyée avec succès !', false);
      },
      error: () => {
        this.loading = false;
        this.flash('❌ Erreur lors de l\'envoi.', true);
      }
    });
  }

  getTypeIcon(type?: string): string {
    const t = type ?? this.msgType;
    const m: Record<string, string> = { INFO: '🔔', MAINTENANCE: '🔧', ALERTE: '⚠️', MISE_A_JOUR: '🚀' };
    return m[t] ?? '🔔';
  }

  getCibleLabel(): string {
    if (this.cible === 'APPRENANTS')  return 'Apprenants';
    if (this.cible === 'ENSEIGNANTS') return 'Enseignants';
    return 'Tous';
  }

  private flash(msg: string, err: boolean): void {
    this.feedback = msg; this.feedbackErr = err;
    setTimeout(() => this.feedback = '', 4000);
  }
}
