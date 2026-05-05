import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { QuizService } from '../../core/services/quiz.service';
import { CatalogueService } from '../../core/services/catalogue.service';
import { TokenService } from '../../core/services/token.service';
import { QuizDTO, TentativeQuizDTO } from '../../models/quiz.model';
import { CoursDTO } from '../../models/cours.model';

@Component({
  selector: 'app-quiz-apprenant',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './quiz-apprenant.component.html',
  styleUrls: ['./quiz-apprenant.component.css']
})
export class QuizApprenantComponent implements OnInit {

  userName = '';
  activeSection: 'quiz' | 'historique' = 'quiz';

  // ── Quiz par cours ──
  mesCours: CoursDTO[] = [];
  coursSelectionne: CoursDTO | null = null;
  quizDuCours: QuizDTO[] = [];
  loadingCours = false;
  loadingQuiz = false;

  // ── Historique tentatives ──
  mesTentatives: TentativeQuizDTO[] = [];
  loadingTentatives = false;
  tentativeDetails: TentativeQuizDTO | null = null;
  showDetailsModal = false;

  // ── Quiz runner ──
  showQuizRunner = false;
  quizEnCours: QuizDTO | null = null;
  questionsActuelles: any[] = [];
  reponsesSaisies: { [questionId: number]: number } = {};
  questionActuelleIndex = 0;
  quizTermine = false;
  resultats: TentativeQuizDTO | null = null;
  timerRestant = 0;
  timerInterval: any;
  submitting = false;
  errorMsg = '';

  constructor(
    private quizService: QuizService,
    private catalogueService: CatalogueService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.userName = this.tokenService.getDisplayName();
    this.chargerMesCours();
  }

  // ── Cours ─────────────────────────────────────────────────────────────────

  chargerMesCours(): void {
    this.loadingCours = true;
    this.catalogueService.getMesCours().subscribe({
      next: (cours) => {
        this.mesCours = cours;
        this.loadingCours = false;
        if (cours.length > 0) this.selectionnerCours(cours[0]);
      },
      error: () => { this.loadingCours = false; }
    });
  }

  selectionnerCours(cours: CoursDTO): void {
    this.coursSelectionne = cours;
    this.loadingQuiz = true;
    this.quizDuCours = [];
    this.quizService.getQuizDisponiblesParCours(cours.idCours!).subscribe({
      next: (quiz) => { this.quizDuCours = quiz; this.loadingQuiz = false; },
      error: () => { this.loadingQuiz = false; }
    });
  }

  // ── Historique ─────────────────────────────────────────────────────────────

  chargerHistorique(): void {
    this.loadingTentatives = true;
    this.quizService.getMesTentatives().subscribe({
      next: (t) => { this.mesTentatives = t; this.loadingTentatives = false; },
      error: () => { this.loadingTentatives = false; }
    });
  }

  setSection(s: 'quiz' | 'historique'): void {
    this.activeSection = s;
    if (s === 'historique') this.chargerHistorique();
  }

  voirDetailsTentative(t: TentativeQuizDTO): void {
    this.quizService.getTentativeById(t.id!).subscribe({
      next: (details) => { this.tentativeDetails = details; this.showDetailsModal = true; },
      error: () => {}
    });
  }

  fermerDetails(): void { this.showDetailsModal = false; this.tentativeDetails = null; }

  // ── Quiz Runner ────────────────────────────────────────────────────────────

  commencerQuiz(quiz: QuizDTO): void {
    this.quizService.getQuizById(quiz.id!).subscribe({
      next: (q) => {
        this.quizEnCours = q;
        this.quizTermine = false;
        this.resultats = null;
        this.reponsesSaisies = {};
        this.questionActuelleIndex = 0;

        // Randomiser si activé
        let questions = [...(q.questions ?? [])];
        if (q.config.randomiserQuestions) {
          questions = questions.sort(() => Math.random() - .5);
        }
        if (q.config.randomiserReponses) {
          questions = questions.map(qu => ({
            ...qu,
            reponses: [...qu.reponses].sort(() => Math.random() - .5)
          }));
        }
        this.questionsActuelles = questions;
        this.showQuizRunner = true;

        // Timer
        if (q.config.tempsLimiteMinutes) {
          this.timerRestant = q.config.tempsLimiteMinutes * 60;
          this.demarrerTimer();
        } else {
          this.timerRestant = 0;
        }
      },
      error: (e) => { this.errorMsg = e.message; }
    });
  }

  demarrerTimer(): void {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timerRestant--;
      if (this.timerRestant <= 0) {
        clearInterval(this.timerInterval);
        this.soumettrQuiz();
      }
    }, 1000);
  }

  get timerFormate(): string {
    const m = Math.floor(this.timerRestant / 60);
    const s = this.timerRestant % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  get timerUrgent(): boolean { return this.timerRestant > 0 && this.timerRestant <= 60; }

  selectionnerReponse(questionId: number, reponseId: number): void {
    if (this.quizTermine) return;
    this.reponsesSaisies[questionId] = reponseId;

    // Correction instantanée : avance auto après 1.2s
    if (this.quizEnCours?.config.correctionInstantanee) {
      if (this.questionActuelleIndex < this.questionsActuelles.length - 1) {
        setTimeout(() => this.questionSuivante(), 1200);
      }
    }
  }

  reponseSelectionnee(questionId: number, reponseId: number): boolean {
    return this.reponsesSaisies[questionId] === reponseId;
  }

  getStatutReponse(questionId: number, reponseId: number, estCorrecte: boolean): string {
    if (!this.quizEnCours?.config.correctionInstantanee) return '';
    if (this.reponsesSaisies[questionId] !== reponseId) return '';
    return estCorrecte ? 'correcte' : 'incorrecte';
  }

  questionSuivante(): void {
    if (this.questionActuelleIndex < this.questionsActuelles.length - 1) {
      this.questionActuelleIndex++;
    }
  }

  questionPrecedente(): void {
    if (this.questionActuelleIndex > 0) this.questionActuelleIndex--;
  }

  allerQuestion(index: number): void { this.questionActuelleIndex = index; }

  get questionCourante(): any { return this.questionsActuelles[this.questionActuelleIndex]; }

  get toutesReponsesRemplies(): boolean {
    return this.questionsActuelles.every(q => this.reponsesSaisies[q.id] !== undefined);
  }

  get progression(): number {
    if (!this.questionsActuelles.length) return 0;
    return Math.round((Object.keys(this.reponsesSaisies).length / this.questionsActuelles.length) * 100);
  }

  soumettrQuiz(): void {
    clearInterval(this.timerInterval);
    if (!this.quizEnCours) return;
    this.submitting = true;
    const dto = {
      quizId: this.quizEnCours.id!,
      reponses: Object.entries(this.reponsesSaisies).map(([qId, rId]) => ({
        questionId: Number(qId),
        reponseIdSelectionnee: rId
      }))
    };
    this.quizService.soumettreQuiz(dto).subscribe({
      next: (res) => {
        this.resultats = res;
        this.quizTermine = true;
        this.submitting = false;
      },
      error: (e) => { this.errorMsg = e.message; this.submitting = false; }
    });
  }

  recommencerQuiz(): void {
    if (this.quizEnCours) this.commencerQuiz(this.quizEnCours);
  }

  fermerQuiz(): void {
    clearInterval(this.timerInterval);
    this.showQuizRunner = false;
    this.quizEnCours = null;
    this.quizTermine = false;
    this.resultats = null;
  }

  get messageScore(): string {
    if (!this.resultats) return '';
    const s = this.resultats.scoreSur20;
    const nom = this.userName;
    if (s < 10) return 'Niveau insuffisant, vous devez améliorer votre niveau';
    if (s <= 15) return 'Niveau assez bien';
    return `Excellent travail ${nom} !`;
  }

  get couleurScore(): string {
    if (!this.resultats) return '';
    const s = this.resultats.scoreSur20;
    if (s < 10) return 'score-rouge';
    if (s <= 15) return 'score-orange';
    return 'score-vert';
  }

  getNbReponses(): number {
  return Object.keys(this.reponsesSaisies).length;
}
}
