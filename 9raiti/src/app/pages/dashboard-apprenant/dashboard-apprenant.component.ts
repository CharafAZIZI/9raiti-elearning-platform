import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { TokenService } from '../../core/services/token.service';
import { UserStateService } from '../../core/services/user-state.service';

@Component({
  selector: 'app-dashboard-apprenant', standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule],
  templateUrl: './dashboard-apprenant.component.html',
  styleUrls: ['./dashboard-apprenant.component.css']
})
export class DashboardApprenantComponent implements OnInit {
  userName = '';
  activeSection = 'accueil';

  stats = [
    { icon: '📚', value: '8',   label: 'Cours inscrits',  color: 'var(--blue)',   dim: 'var(--blue-dim)'   },
    { icon: '✅', value: '3',   label: 'Cours terminés',  color: 'var(--green)',  dim: 'var(--green-dim)'  },
    { icon: '⏱️', value: '24h', label: "Heures d'étude",  color: 'var(--brand)',  dim: 'var(--brand-dim)'  },
    { icon: '🏆', value: '2',   label: 'Certificats',     color: 'var(--orange)', dim: 'var(--orange-dim)' },
  ];

  courses = [
    { id:1, title:'Introduction aux mathématiques avancées', category:'Mathématiques', teacher:'Prof. Alaoui',
      progress:75, icon:'📐', color:'var(--blue)',   dim:'var(--blue-dim)',   duration:'12h', rating:4.8, nextLesson:'Intégration' },
    { id:2, title:'Algorithmique et structures de données',  category:'Informatique',  teacher:'Prof. Benali',
      progress:45, icon:'💻', color:'var(--brand)',  dim:'var(--brand-dim)',  duration:'18h', rating:4.9, nextLesson:'Arbres binaires' },
    { id:3, title:'Physique : Mécanique classique',          category:'Sciences',      teacher:'Prof. Rachidi',
      progress:90, icon:'⚛️', color:'var(--green)',  dim:'var(--green-dim)',  duration:'15h', rating:4.7, nextLesson:'Oscillations' },
    { id:4, title:'Langue arabe — Niveau intermédiaire',     category:'Langues',       teacher:'Prof. Karim',
      progress:20, icon:'📝', color:'var(--purple)', dim:'var(--purple-dim)', duration:'20h', rating:4.6, nextLesson:'Grammaire avancée' },
  ];

  // IA Recommandations (use case du diagramme)
  recommendations = [
    { title:'Calcul différentiel — Niveau avancé', match:94, reason:'Basé sur vos résultats en Mathématiques', icon:'🧮', color:'var(--blue)' },
    { title:'Python pour la science des données',   match:89, reason:'Complément idéal à votre cours Algo',     icon:'🐍', color:'var(--green)' },
    { title:'Thermodynamique',                       match:82, reason:'Prochaine étape après Mécanique classique', icon:'🌡️', color:'var(--orange)' },
  ];

  // Évaluations disponibles (use case du diagramme)
  evaluations = [
    { id:1, title:'Quiz Algorithmique — Chapitre 5', course:'Algorithmique', date:'10 Mar 2025', duration:'30min', type:'quiz',  status:'disponible',  score: null },
    { id:2, title:'Examen mi-session — Mathématiques', course:'Mathématiques', date:'12 Mar 2025', duration:'2h',   type:'examen', status:'disponible',  score: null },
    { id:3, title:'Quiz Physique — Thermodynamique',  course:'Physique',       date:'5 Mar 2025',  duration:'20min', type:'quiz', status:'termine',     score: 17 },
    { id:4, title:'Quiz Langue Arabe — Grammaire',    course:'Langue arabe',   date:'1 Mar 2025',  duration:'15min', type:'quiz', status:'termine',     score: 14 },
  ];

  // Progression détaillée
  progression = [
    { date:"Aujourd'hui", action:'Chapitre 5 complété', course:'Algorithmique', type:'chapitre', points:50 },
    { date:'Hier',        action:'Quiz #3 — 16/20',     course:'Mathématiques', type:'quiz',     points:80 },
    { date:'25 Fév',      action:'Chapitre 9 en cours', course:'Physique',      type:'cours',    points:25 },
    { date:'23 Fév',      action:'Nouvelle inscription', course:'Langue arabe', type:'inscription', points:10 },
  ];

  // Session quiz active
  showQuizModal = false;
  currentQuiz = {
    title: 'Quiz Algorithmique — Chapitre 5',
    question: 'Quelle est la complexité temporelle de l\'algorithme de tri rapide (Quicksort) dans le cas moyen ?',
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    selected: -1, timeLeft: 1800, answered: false, correct: false
  };

  constructor(
    private tokenService: TokenService,
    private userStateService: UserStateService
  ) {}
  ngOnInit(): void {
    this.userName = this.tokenService.getDisplayName();
    this.userStateService.user$.subscribe(() => {
      this.userName = this.userStateService.getDisplayName();
    });
  }

  setSection(s: string) { this.activeSection = s; }

  selectAnswer(i: number) {
    if (this.currentQuiz.answered) return;
    this.currentQuiz.selected = i;
    this.currentQuiz.answered = true;
    this.currentQuiz.correct = i === 1; // index 1 = O(n log n) is correct
  }

  openQuiz(ev: any) { this.showQuizModal = true; this.currentQuiz.selected = -1; this.currentQuiz.answered = false; }
  closeQuiz() { this.showQuizModal = false; }

  getEvalStatus(ev: any): {label:string; cls:string} {
    if (ev.status === 'termine') return { label:`${ev.score}/20`, cls:'b-green' };
    return { label:'Disponible', cls:'b-brand' };
  }
}
