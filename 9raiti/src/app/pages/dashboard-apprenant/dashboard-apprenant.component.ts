import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { TokenService } from '../../core/services/token.service';

@Component({ selector: 'app-dashboard-apprenant', standalone: true, imports: [CommonModule, NavbarComponent],
  templateUrl: './dashboard-apprenant.component.html', styleUrls: ['./dashboard-apprenant.component.css'] })
export class DashboardApprenantComponent implements OnInit {
  userName = '';
  stats = [
    { icon: '📚', iconBg: 'background: var(--info-bg);',    value: '8',   label: 'Cours inscrits' },
    { icon: '✅', iconBg: 'background: var(--success-bg);', value: '3',   label: 'Cours terminés' },
    { icon: '⏱️', iconBg: 'background: var(--brand-bg);',   value: '24h', label: "Heures d'étude" },
    { icon: '🏆', iconBg: 'background: var(--warning-bg);', value: '2',   label: 'Certificats' },
  ];
  courses = [
    { title: 'Introduction aux mathématiques avancées', category: 'Mathématiques', catColor: 'var(--info-color)',
      teacher: 'Prof. Alaoui',  progress: 75, icon: '📐',
      thumbBg: 'background: var(--info-bg);', progressColor: 'var(--info-color)' },
    { title: 'Algorithmique et structures de données', category: 'Informatique', catColor: 'var(--brand-light)',
      teacher: 'Prof. Benali',  progress: 45, icon: '💻',
      thumbBg: 'background: var(--brand-bg);', progressColor: 'var(--brand-light)' },
    { title: 'Physique : Mécanique classique', category: 'Sciences', catColor: 'var(--success-color)',
      teacher: 'Prof. Rachidi', progress: 90, icon: '⚛️',
      thumbBg: 'background: var(--success-bg);', progressColor: 'var(--success-color)' },
    { title: 'Langue arabe — Niveau intermédiaire', category: 'Langues', catColor: '#c084fc',
      teacher: 'Prof. Karim',   progress: 20, icon: '📝',
      thumbBg: 'background: rgba(168,85,247,0.08);', progressColor: '#a855f7' },
  ];
  activities = [
    { date: "Aujourd'hui", course: 'Algorithmique', action: 'Chapitre 5 complété', status: 'Terminé',   badgeClass: 'badge-success' },
    { date: 'Hier',        course: 'Mathématiques', action: 'Quiz #3 — 16/20',    status: 'Terminé',   badgeClass: 'badge-success' },
    { date: '25 Fév',      course: 'Physique',      action: 'Chapitre 9 en cours',status: 'En cours',  badgeClass: 'badge-info' },
    { date: '23 Fév',      course: 'Langue arabe',  action: 'Inscription',        status: 'Nouveau',   badgeClass: 'badge-brand' },
  ];
  constructor(private tokenService: TokenService) {}
  ngOnInit(): void { this.userName = this.tokenService.getDisplayName(); }
}
