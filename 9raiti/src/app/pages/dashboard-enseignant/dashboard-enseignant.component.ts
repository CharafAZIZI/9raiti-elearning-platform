import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { TokenService } from '../../core/services/token.service';

@Component({ selector: 'app-dashboard-enseignant', standalone: true, imports: [CommonModule, NavbarComponent],
  templateUrl: './dashboard-enseignant.component.html', styleUrls: ['./dashboard-enseignant.component.css'] })
export class DashboardEnseignantComponent implements OnInit {
  userName = '';
  stats = [
    { icon: '📖', iconBg: 'background: var(--info-bg);',    value: '5',   label: 'Cours publiés' },
    { icon: '👥', iconBg: 'background: var(--success-bg);', value: '148', label: 'Étudiants inscrits' },
    { icon: '⭐', iconBg: 'background: var(--brand-bg);',   value: '4.7', label: 'Note moyenne' },
    { icon: '💬', iconBg: 'background: var(--warning-bg);', value: '12',  label: 'Questions en attente' },
  ];
  myCourses = [
    { title: 'Algèbre linéaire — Niveau L1', students: 45, rating: 4.8, status: 'Publié',   statusBadge: 'badge-success',
      icon: '📐', thumbBg: 'background: var(--info-bg);' },
    { title: 'Analyse numérique',            students: 32, rating: 4.6, status: 'Publié',   statusBadge: 'badge-success',
      icon: '📊', thumbBg: 'background: var(--success-bg);' },
    { title: 'Probabilités et statistiques', students: 0,  rating: 0,   status: 'Brouillon',statusBadge: 'badge-warning',
      icon: '🎲', thumbBg: 'background: var(--brand-bg);' },
  ];
  recentEnrollments = [
    { date: "Aujourd'hui", student: 'Karim M.',  initial: 'K', avatarStyle: 'background: var(--info-bg); color: var(--info-color);',    course: 'Algèbre linéaire',  action: 'Inscription' },
    { date: 'Hier',        student: 'Fatima Z.', initial: 'F', avatarStyle: 'background: var(--error-bg); color: var(--error-color);',  course: 'Analyse numérique', action: 'Chapitre 3 terminé' },
    { date: '25 Fév',      student: 'Yassine B.',initial: 'Y', avatarStyle: 'background: var(--success-bg); color: var(--success-color);', course: 'Algèbre linéaire', action: 'Quiz #2 passé' },
    { date: '24 Fév',      student: 'Sara L.',   initial: 'S', avatarStyle: 'background: rgba(168,85,247,0.1); color: #c084fc;',        course: 'Analyse numérique', action: 'Inscription' },
  ];
  constructor(private tokenService: TokenService) {}
  ngOnInit(): void { this.userName = this.tokenService.getDisplayName(); }
}
