import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { CoursInteractionComponent } from '../../components/cours-interaction/cours-interaction.component';
import { NotificationCenterComponent } from '../../components/notification-center/notification-center.component';
import { AiRecommendationsComponent } from '../../components/ai-recommendations/ai-recommendations.component';

import { TokenService } from '../../core/services/token.service';
import { UserStateService } from '../../core/services/user-state.service';
import { CatalogueService } from '../../core/services/catalogue.service';
import { InscriptionService } from '../../core/services/inscription.service';
import { NotificationService } from '../../core/services/notification.service';
import { QuizService } from '../../core/services/quiz.service';

import { CategorieDTO } from '../../models/categorie.model';
import { ModuleDTO } from '../../models/module.model';
import { CoursDTO } from '../../models/cours.model';
import { InscriptionDTO } from '../../models/inscription.model';


import {
  QuizDTO,
  QuestionDTO,
  TentativeQuizDTO
} from '../../models/quiz.model';

@Component({
  selector: 'app-dashboard-apprenant',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    RouterModule,
    FormsModule,
    CoursInteractionComponent,
    NotificationCenterComponent,
    AiRecommendationsComponent
  ],
  templateUrl: './dashboard-apprenant.component.html',
  styleUrls: ['./dashboard-apprenant.component.css']
})
export class DashboardApprenantComponent implements OnInit, OnDestroy {

  userName = '';
  userEmail = '';
  activeSection = 'accueil';

  stats = [
    {
      icon: '📂',
      value: '–',
      label: 'Catégories',
      color: 'var(--green)',
      dim: 'var(--green-dim)'
    },
    {
      icon: '📦',
      value: '–',
      label: 'Modules',
      color: 'var(--brand)',
      dim: 'var(--brand-dim)'
    },
    {
      icon: '📘',
      value: '–',
      label: 'Cours publiés',
      color: 'var(--blue)',
      dim: 'var(--blue-dim)'
    },
    {
      icon: '🎯',
      value: '–',
      label: 'Quiz passés',
      color: 'var(--purple)',
      dim: 'var(--purple-dim)'
    }
  ];

  // ───────────────── Catalogue ─────────────────

  categories: CategorieDTO[] = [];
  modules: ModuleDTO[] = [];
  cours: CoursDTO[] = [];

  loadingCatalogue = false;

  catalogNiveau: 0 | 1 | 2 = 0;

  selectedCat: CategorieDTO | null = null;
  selectedMod: ModuleDTO | null = null;

  catModules: ModuleDTO[] = [];
  modCours: CoursDTO[] = [];

  loadingModules = false;
  loadingCours = false;

  // ═════════════════════════════════ QUIZ ═════════════════════════════════

  tousCours: CoursDTO[] = [];
  coursSelectionne: CoursDTO | null = null;

  quizDuCours: QuizDTO[] = [];

  loadingQuizCours = false;
  loadingTousCours = false;

  // Historique tentatives

  mesTentatives: TentativeQuizDTO[] = [];

  loadingTentatives = false;

  showHistorique = false;

  tentativeDetails: TentativeQuizDTO | null = null;
  showTentativeDetails = false;

  // ───────────── Quiz Runner ─────────────

  showRunner = false;

  quizEnCours: QuizDTO | null = null;

  questionsRunn: QuestionDTO[] = [];

  reponsesSaisies: { [qId: number]: number } = {};

  indexQuestion = 0;

  quizTermine = false;

  resultats: TentativeQuizDTO | null = null;

  timerRestant = 0;

  timerInterval: any;

  submitting = false;

  runnerError = '';

  // ───────────── Mes modules inscrits ─────────────

  mesInscriptions: InscriptionDTO[] = [];

  loadingInscriptions = false;

  coursByModule: Record<number, CoursDTO[]> = {};

  loadingCoursByModule: Record<number, boolean> = {};

  expandedModuleId: number | null = null;


  
  userId!: number;


  constructor(
    private tokenService: TokenService,
    private userStateService: UserStateService,
    private catalogueService: CatalogueService,
    private inscriptionService: InscriptionService,
    private router: Router,
    private notifService: NotificationService,
    private quizService: QuizService,
    private cdr: ChangeDetectorRef
  ) {}

  // ───────────────── Lifecycle ─────────────────

  ngOnInit(): void {

    this.notifService.connect();

    this.userId = this.tokenService.getEnseignantId()!;

    this.userName = this.tokenService.getDisplayName();

    this.userEmail =
      this.tokenService.getUser()?.email ?? '';

    this.userStateService.user$.subscribe(() => {

      this.userName =
        this.userStateService.getDisplayName();

      this.userEmail =
        this.tokenService.getUser()?.email ?? '';
    });

    this.loadCatalogue();

    this.loadMesInscriptions();
  }

  ngOnDestroy(): void {

    this.notifService.disconnect();

    clearInterval(this.timerInterval);
  }

  // ───────────────── Catalogue ─────────────────

  loadCatalogue(): void {

    this.loadingCatalogue = true;

    this.catalogueService.getAllCategories().subscribe({

      next: cats => {

        this.categories = cats;

        this.stats[0].value = String(cats.length);

        this.loadingCatalogue = false;

        this.cdr.detectChanges();
      },

      error: () => {

        this.loadingCatalogue = false;
      }
    });

    this.catalogueService.getAllModules().subscribe({

      next: mods => {

        this.modules = mods;

        const actifs = mods.filter(
          m => m.actif &&
          (!m.statut || m.statut === 'ACTIF')
        );

        this.stats[1].value =
          String(actifs.length);
      }
    });

    this.catalogueService.getAllCours().subscribe({

      next: c => {

        this.cours = c;

        this.tousCours =
          c.filter(x => x.statut === 'PUBLIE');

        this.stats[2].value =
          String(this.tousCours.length);
      }
    });
  }

  selectionnerCategorie(cat: CategorieDTO): void {

    this.selectedCat = cat;

    this.selectedMod = null;

    this.catalogNiveau = 1;

    this.loadingModules = true;

    this.catModules = [];

    this.catalogueService
      .getModulesByCategorie(cat.id!)
      .subscribe({

        next: m => {

          this.catModules =
            m.filter(
              x =>
                x.actif &&
                (!x.statut || x.statut === 'ACTIF')
            );

          this.loadingModules = false;
        },

        error: () => {

          this.loadingModules = false;
        }
      });
  }

  selectionnerModule(mod: ModuleDTO): void {

    this.selectedMod = mod;

    this.catalogNiveau = 2;

    this.loadingCours = true;

    this.modCours = [];

    this.catalogueService
      .getCoursByModule(mod.id!)
      .subscribe({

        next: c => {

          this.modCours =
            c.filter(x => x.statut === 'PUBLIE');

          this.loadingCours = false;
        },

        error: () => {

          this.loadingCours = false;
        }
      });
  }

  retourCategories(): void {

    this.catalogNiveau = 0;

    this.selectedCat = null;

    this.selectedMod = null;
  }

  retourModules(): void {

    this.catalogNiveau = 1;

    this.selectedMod = null;
  }

  getModulesCount(catId: number): number {

    return this.modules.filter(
      m =>
        m.categorieId === catId &&
        m.actif &&
        (!m.statut || m.statut === 'ACTIF')
    ).length;
  }

  getCoursCount(modId: number): number {

    return this.cours.filter(
      c =>
        c.moduleId === modId &&
        c.statut === 'PUBLIE'
    ).length;
  }

  // ═════════════════════════════════ QUIZ ═════════════════════════════════

  ouvrirSectionQuiz(): void {

    this.setSection('quiz');

    this.showHistorique = false;

    this.chargerQuizDuCours();

    this.chargerHistorique();
  }

  chargerQuizDuCours(): void {

    if (!this.coursSelectionne && this.tousCours.length > 0) {

      this.selectionnerCoursQuiz(this.tousCours[0]);

    } else if (this.coursSelectionne) {

      this.selectionnerCoursQuiz(this.coursSelectionne);
    }
  }

  selectionnerCoursQuiz(cours: CoursDTO): void {

    this.coursSelectionne = cours;

    this.loadingQuizCours = true;

    this.quizDuCours = [];

    this.quizService
      .getQuizDisponiblesParCours(cours.idCours!)
      .subscribe({

        next: q => {

          this.quizDuCours = q;

          this.loadingQuizCours = false;

          this.cdr.detectChanges();
        },

        error: () => {

          this.loadingQuizCours = false;
        }
      });
  }

  chargerHistorique(): void {

    this.loadingTentatives = true;

    this.quizService.getMesTentatives().subscribe({

      next: t => {

        this.mesTentatives = t;

        this.stats[3].value = String(t.length);

        this.loadingTentatives = false;

        this.cdr.detectChanges();
      },

      error: () => {

        this.loadingTentatives = false;
      }
    });
  }

  voirDetailsTentative(t: TentativeQuizDTO): void {

    if (!t.id) return;

    this.quizService.getTentativeById(t.id).subscribe({

      next: d => {

        this.tentativeDetails = d;

        this.showTentativeDetails = true;

        this.cdr.detectChanges();
      },

      error: () => {}
    });
  }

  fermerDetailsTentative(): void {

    this.showTentativeDetails = false;

    this.tentativeDetails = null;
  }

  // ───────────────── Mes modules inscrits ─────────────────

  loadMesInscriptions(): void {

    this.loadingInscriptions = true;

    this.inscriptionService.getMesInscriptions().subscribe({

      next: (ins) => {

        this.mesInscriptions = ins;

        this.loadingInscriptions = false;
      },

      error: () => {

        this.loadingInscriptions = false;
      }
    });
  }

  toggleModule(moduleId: number): void {

    if (this.expandedModuleId === moduleId) {

      this.expandedModuleId = null;

      return;
    }

    this.expandedModuleId = moduleId;

    if (!this.coursByModule[moduleId]) {

      this.loadingCoursByModule[moduleId] = true;

      this.catalogueService
        .getCoursByModule(moduleId)
        .subscribe({

          next: (c) => {

            this.coursByModule[moduleId] =
              c.filter(x => x.statut === 'PUBLIE');

            this.loadingCoursByModule[moduleId] = false;
          },

          error: () => {

            this.loadingCoursByModule[moduleId] = false;
          }
        });
    }
  }

  getCoursForModule(moduleId: number): CoursDTO[] {

    return this.coursByModule[moduleId] ?? [];
  }

  // ───────────────── Quiz Runner ─────────────────

  commencerQuiz(quiz: QuizDTO): void {

    this.runnerError = '';

    this.quizService.getQuizById(quiz.id!).subscribe({

      next: q => {

        this.quizEnCours = q;

        this.quizTermine = false;

        this.resultats = null;

        this.reponsesSaisies = {};

        this.indexQuestion = 0;

        let questions = [...(q.questions ?? [])];

        if (q.config.randomiserQuestions) {

          questions =
            questions.sort(() => Math.random() - .5);
        }

        if (q.config.randomiserReponses) {

          questions = questions.map(qu => ({
            ...qu,
            reponses:
              [...(qu.reponses ?? [])]
                .sort(() => Math.random() - .5)
          }));
        }

        this.questionsRunn = questions;

        this.showRunner = true;

        if (q.config.tempsLimiteMinutes) {

          this.timerRestant =
            q.config.tempsLimiteMinutes * 60;

          this.demarrerTimer();

        } else {

          this.timerRestant = 0;
        }

        this.cdr.detectChanges();
      },

      error: e => {

        this.runnerError = e.message;
      }
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

      this.cdr.detectChanges();

    }, 1000);
  }

  get timerFormate(): string {

    const m = Math.floor(this.timerRestant / 60);

    const s = this.timerRestant % 60;

    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  get timerUrgent(): boolean {

    return this.timerRestant > 0 &&
           this.timerRestant <= 60;
  }

  get questionCourante(): QuestionDTO {

    return this.questionsRunn[this.indexQuestion];
  }

  get progression(): number {

    if (!this.questionsRunn.length) return 0;

    return Math.round(
      Object.keys(this.reponsesSaisies).length /
      this.questionsRunn.length * 100
    );
  }

  selectionnerReponse(
    questionId: number,
    reponseId: number
  ): void {

    if (this.quizTermine) return;

    this.reponsesSaisies[questionId] = reponseId;

    if (
      this.quizEnCours?.config.correctionInstantanee &&
      this.indexQuestion < this.questionsRunn.length - 1
    ) {

      setTimeout(() => {

        this.indexQuestion++;

        this.cdr.detectChanges();

      }, 1200);
    }

    this.cdr.detectChanges();
  }

  reponseSelectionnee(
    qId: number,
    rId: number
  ): boolean {

    return this.reponsesSaisies[qId] === rId;
  }

  getStatutReponse(
    qId: number,
    rId: number,
    estCorrecte: boolean
  ): string {

    if (!this.quizEnCours?.config.correctionInstantanee) {
      return '';
    }

    if (this.reponsesSaisies[qId] !== rId) {
      return '';
    }

    return estCorrecte
      ? 'correcte'
      : 'incorrecte';
  }

  questionSuivante(): void {

    if (this.indexQuestion <
        this.questionsRunn.length - 1) {

      this.indexQuestion++;
    }
  }

  questionPrecedente(): void {

    if (this.indexQuestion > 0) {

      this.indexQuestion--;
    }
  }

  allerQuestion(i: number): void {

    this.indexQuestion = i;
  }

  soumettrQuiz(): void {

    clearInterval(this.timerInterval);

    if (!this.quizEnCours) return;

    this.submitting = true;

    const dto = {

      quizId: this.quizEnCours.id!,

      reponses:
        Object.entries(this.reponsesSaisies)
          .map(([qId, rId]) => ({
            questionId: Number(qId),
            reponseIdSelectionnee: rId
          }))
    };

    this.quizService.soumettreQuiz(dto).subscribe({

      next: res => {

        this.resultats = res;

        this.quizTermine = true;

        this.submitting = false;

        this.chargerHistorique();

        this.cdr.detectChanges();
      },

      error: e => {

        this.runnerError = e.message;

        this.submitting = false;
      }
    });
  }

  recommencerQuiz(): void {

    if (this.quizEnCours) {

      this.commencerQuiz(this.quizEnCours);
    }
  }

  fermerRunner(): void {

    clearInterval(this.timerInterval);

    this.showRunner = false;

    this.quizEnCours = null;

    this.quizTermine = false;

    this.resultats = null;

    this.reponsesSaisies = {};

    this.indexQuestion = 0;

    this.runnerError = '';
  }

  get messageScore(): string {

    if (!this.resultats) return '';

    const s = this.resultats.scoreSur20;

    if (s < 10) {

      return 'Niveau insuffisant — travaillez encore davantage !';
    }

    if (s <= 15) {

      return 'Assez bien — vous pouvez encore progresser.';
    }

    return `Excellent travail ${this.userName} ! 🎉`;
  }

  get couleurScore(): string {

    if (!this.resultats) {
      return 'var(--text)';
    }

    const s = this.resultats.scoreSur20;

    if (s < 10) return 'var(--red)';

    if (s <= 15) return 'var(--orange)';

    return 'var(--green)';
  }

  // ───────────────── Navigation ─────────────────

  setSection(s: string): void {

    this.activeSection = s;
  }

  navigateToProfil(): void {

    this.router.navigate(['/profil']);
  }

  // ───────────────── Helpers ─────────────────

  getNiveauCls(n?: string): string {

    if (n === 'DEBUTANT') return 'b-green';

    if (n === 'INTERMEDIAIRE') return 'b-blue';

    return 'b-red';
  }

  getStatutCoursCls(s?: string): string {

    if (s === 'PUBLIE') return 'b-green';

    if (s === 'ARCHIVE') return 'b-red';

    return 'b-orange';
  }

  formatDate(d?: string): string {

    if (!d) return '—';

    return new Date(d).toLocaleDateString(
      'fr-FR',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  }
}