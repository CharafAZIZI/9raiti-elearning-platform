import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { TokenService } from '../../core/services/token.service';
import { UserStateService } from '../../core/services/user-state.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { FeedbackDTO, TypeAvis, TYPE_AVIS_LABELS } from '../../models/feedback.model';

@Component({
  selector: 'app-dashboard-apprenant',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dashboard-apprenant.component.html',
  styleUrls: ['./dashboard-apprenant.component.css']
})
export class DashboardApprenantComponent implements OnInit {

  userName      = '';
  activeSection = 'accueil';
  userEmail     = '';

  // ── Modal Feedback ──────────────────────────────────────────────────────────
  showFeedbackModal   = false;
  feedbackCoursId: number | null = null;

  // Champs du formulaire feedback (inline dans le modal)
  fbEmail   = '';
  fbType: TypeAvis | '' = '';
  fbMessage = '';
  fbLoading = false;
  fbSuccess = '';
  fbError   = '';

  readonly typesAvis: { value: TypeAvis; label: string }[] =
    Object.entries(TYPE_AVIS_LABELS).map(([v, l]) => ({ value: v as TypeAvis, label: l }));

  // ── Stats ───────────────────────────────────────────────────────────────────
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

  recommendations = [
    { title:'Calcul différentiel — Niveau avancé', match:94, reason:'Basé sur vos résultats en Mathématiques', icon:'🧮', color:'var(--blue)' },
    { title:'Python pour la science des données',   match:89, reason:'Complément idéal à votre cours Algo',     icon:'🐍', color:'var(--green)' },
    { title:'Thermodynamique',                       match:82, reason:'Prochaine étape après Mécanique classique', icon:'🌡️', color:'var(--orange)' },
  ];

  evaluations = [
    { id:1, title:'Quiz Algorithmique — Chapitre 5',   course:'Algorithmique',  date:'10 Mar 2025', duration:'30min', type:'quiz',  status:'disponible', score: null },
    { id:2, title:'Examen mi-session — Mathématiques', course:'Mathématiques',  date:'12 Mar 2025', duration:'2h',   type:'examen', status:'disponible', score: null },
    { id:3, title:'Quiz Physique — Thermodynamique',   course:'Physique',        date:'5 Mar 2025',  duration:'20min', type:'quiz', status:'termine',    score: 17 },
    { id:4, title:'Quiz Langue Arabe — Grammaire',     course:'Langue arabe',   date:'1 Mar 2025',  duration:'15min', type:'quiz', status:'termine',    score: 14 },
  ];

  progression = [
    { date:"Aujourd'hui", action:'Chapitre 5 complété', course:'Algorithmique', type:'chapitre', points:50 },
    { date:'Hier',        action:'Quiz #3 — 16/20',     course:'Mathématiques', type:'quiz',     points:80 },
    { date:'25 Fév',      action:'Chapitre 9 en cours', course:'Physique',      type:'cours',    points:25 },
    { date:'23 Fév',      action:'Nouvelle inscription', course:'Langue arabe', type:'inscription', points:10 },
  ];

  showQuizModal = false;
  currentQuiz = {
    title: 'Quiz Algorithmique — Chapitre 5',
    question: "Quelle est la complexité temporelle de l'algorithme de tri rapide (Quicksort) dans le cas moyen ?",
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    selected: -1, timeLeft: 1800, answered: false, correct: false
  };

  constructor(
    private tokenService: TokenService,
    private userStateService: UserStateService,
    private feedbackService: FeedbackService
  ) {}

  ngOnInit(): void {
    this.userName  = this.tokenService.getDisplayName();
    this.userEmail = this.tokenService.getUser()?.email ?? '';
    this.userStateService.user$.subscribe(() => {
      this.userName  = this.userStateService.getDisplayName();
      this.userEmail = this.tokenService.getUser()?.email ?? '';
    });
  }

  setSection(s: string): void { this.activeSection = s; }

  // ── Quiz ────────────────────────────────────────────────────────────────────

  selectAnswer(i: number): void {
    if (this.currentQuiz.answered) return;
    this.currentQuiz.selected = i;
    this.currentQuiz.answered = true;
    this.currentQuiz.correct  = i === 1;
  }

  openQuiz(ev: any): void { this.showQuizModal = true; this.currentQuiz.selected = -1; this.currentQuiz.answered = false; }
  closeQuiz(): void { this.showQuizModal = false; }

  getEvalStatus(ev: any): { label: string; cls: string } {
    if (ev.status === 'termine') return { label: `${ev.score}/20`, cls: 'b-green' };
    return { label: 'Disponible', cls: 'b-brand' };
  }

  // ── Feedback ────────────────────────────────────────────────────────────────

  /** Ouvre le modal feedback global (pas lié à un cours) */
  ouvrirFeedbackGlobal(): void {
    this.feedbackCoursId = null;
    this._resetFeedbackForm();
    this.showFeedbackModal = true;
  }

  /** Ouvre le modal feedback lié à un cours précis */
  ouvrirFeedbackCours(coursId: number): void {
    this.feedbackCoursId = coursId;
    this._resetFeedbackForm();
    this.showFeedbackModal = true;
  }

  fermerFeedback(): void {
    this.showFeedbackModal = false;
    this.feedbackCoursId   = null;
    this._resetFeedbackForm();
  }

  soumettreFeedback(): void {
    if (!this.fbEmail || !this.fbType || !this.fbMessage) return;

    this.fbLoading = true;
    this.fbError   = '';
    this.fbSuccess = '';

    const dto: FeedbackDTO = {
      email:    this.userEmail || this.fbEmail,
      typeAvis: this.fbType as TypeAvis,
      message:  this.fbMessage,
      coursId:  this.feedbackCoursId ?? undefined,
    };

    // Connecté → endpoint authentifié, sinon anonyme
    const request$ = this.tokenService.isLoggedIn()
      ? this.feedbackService.soumettreAuthentifie(dto)
      : this.feedbackService.soumettreAnonyme(dto);

    request$.subscribe({
      next: () => {
        this.fbLoading = false;
        this.fbSuccess = 'Votre avis a bien été envoyé. Merci !';
        setTimeout(() => this.fermerFeedback(), 2500);
      },
      error: (err: Error) => {
        this.fbLoading = false;
        this.fbError   = err.message;
      }
    });
  }

  private _resetFeedbackForm(): void {
    this.fbEmail   = this.userEmail;
    this.fbType    = '';
    this.fbMessage = '';
    this.fbLoading = false;
    this.fbSuccess = '';
    this.fbError   = '';
  }
}
