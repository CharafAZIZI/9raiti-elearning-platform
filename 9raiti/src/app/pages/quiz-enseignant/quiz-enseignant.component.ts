import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule, ReactiveFormsModule, FormBuilder, FormGroup,
  FormArray, Validators, AbstractControl
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { QuizService } from '../../core/services/quiz.service';
import { CatalogueService } from '../../core/services/catalogue.service';
import { TokenService } from '../../core/services/token.service';
import { QuizDTO, QuestionDTO, ReponseDTO, TypeQuestion } from '../../models/quiz.model';
import { CoursDTO } from '../../models/cours.model';

@Component({
  selector: 'app-quiz-enseignant',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, NavbarComponent],
  templateUrl: './quiz-enseignant.component.html',
  styleUrls: ['./quiz-enseignant.component.css']
})
export class QuizEnseignantComponent implements OnInit {

  quiz: QuizDTO[] = [];
  mesCours: CoursDTO[] = [];
  loading = false;
  successMsg = '';
  errorMsg = '';

  // ── Modal Quiz ──
  showQuizModal = false;
  editingQuiz: QuizDTO | null = null;
  quizForm!: FormGroup;
  quizLoading = false;

  // ── Modal Questions ──
  showQuestionsModal = false;
  quizSelectionne: QuizDTO | null = null;
  questionsLoading = false;

  // ── Modal Question (ajout/édition) ──
  showQuestionModal = false;
  editingQuestion: QuestionDTO | null = null;
  questionForm!: FormGroup;
  questionLoading = false;

  // ── Suppression ──
  deleteTarget: { type: 'quiz' | 'question'; id: number; nom: string } | null = null;

  // ── Détails Quiz ──
  showDetailsModal = false;
  quizDetails: QuizDTO | null = null;

  constructor(
    private fb: FormBuilder,
    private quizService: QuizService,
    private catalogueService: CatalogueService,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.buildQuizForm();
    this.chargerMesQuiz();
    this.chargerMesCours();
  }

  // ── Chargement ────────────────────────────────────────────────────────────

  chargerMesQuiz(): void {
    this.loading = true;
    this.quizService.getMesQuiz().subscribe({
      next: (data) => { this.quiz = data; this.loading = false; },
      error: (e) => { this.errorMsg = e.message; this.loading = false; }
    });
  }

  chargerMesCours(): void {
    this.catalogueService.getMesCours().subscribe({
      next: (data) => { this.mesCours = data; },
      error: () => {}
    });
  }

  // ── Quiz Form ─────────────────────────────────────────────────────────────

  buildQuizForm(quiz?: QuizDTO): void {
    this.quizForm = this.fb.group({
      titre: [quiz?.titre ?? '', [Validators.required, Validators.minLength(3)]],
      description: [quiz?.description ?? ''],
      coursId: [quiz?.coursId ?? null, Validators.required],
      actif: [quiz?.actif ?? true],
      correctionInstantanee: [quiz?.config?.correctionInstantanee ?? false],
      tempsLimiteMinutes: [quiz?.config?.tempsLimiteMinutes ?? null],
      randomiserQuestions: [quiz?.config?.randomiserQuestions ?? false],
      randomiserReponses: [quiz?.config?.randomiserReponses ?? false],
    });
  }

  ouvrirCreerQuiz(): void {
    this.editingQuiz = null;
    this.buildQuizForm();
    this.showQuizModal = true;
  }

  ouvrirModifierQuiz(quiz: QuizDTO): void {
    this.editingQuiz = quiz;
    this.buildQuizForm(quiz);
    this.showQuizModal = true;
  }

  fermerQuizModal(): void {
    this.showQuizModal = false;
    this.editingQuiz = null;
  }

  sauvegarderQuiz(): void {
    if (this.quizForm.invalid) { this.quizForm.markAllAsTouched(); return; }
    const v = this.quizForm.value;
    const dto: QuizDTO = {
      titre: v.titre,
      description: v.description,
      coursId: Number(v.coursId),
      actif: v.actif,
      config: {
        correctionInstantanee: v.correctionInstantanee,
        tempsLimiteMinutes: v.tempsLimiteMinutes ? Number(v.tempsLimiteMinutes) : null,
        randomiserQuestions: v.randomiserQuestions,
        randomiserReponses: v.randomiserReponses
      }
    };
    this.quizLoading = true;
    const obs = this.editingQuiz?.id
      ? this.quizService.mettreAJourQuiz(this.editingQuiz.id, dto)
      : this.quizService.creerQuiz(dto);

    obs.subscribe({
      next: () => {
        this.showSuccess(this.editingQuiz ? 'Quiz modifié avec succès.' : 'Quiz créé avec succès.');
        this.quizLoading = false;
        this.fermerQuizModal();
        this.chargerMesQuiz();
      },
      error: (e) => { this.errorMsg = e.message; this.quizLoading = false; }
    });
  }

  // ── Questions ─────────────────────────────────────────────────────────────

  ouvrirQuestions(quiz: QuizDTO): void {
    this.questionsLoading = true;
    this.quizService.getQuizById(quiz.id!).subscribe({
      next: (q) => {
        this.quizSelectionne = q;
        this.questionsLoading = false;
        this.showQuestionsModal = true;
      },
      error: (e) => { this.errorMsg = e.message; this.questionsLoading = false; }
    });
  }

  fermerQuestionsModal(): void {
    this.showQuestionsModal = false;
    this.quizSelectionne = null;
  }

  // ── Question Form ─────────────────────────────────────────────────────────

  buildQuestionForm(question?: QuestionDTO): void {
    const type = question?.type ?? 'QCM';
    this.questionForm = this.fb.group({
      texte: [question?.texte ?? '', [Validators.required, Validators.minLength(3)]],
      type: [type, Validators.required],
      reponses: this.fb.array(
        question?.reponses?.length
          ? question.reponses.map(r => this.creerReponseGroup(r))
          : (type === 'VRAI_FAUX' ? this.reponsesPourVraiFaux() : [this.creerReponseGroup(), this.creerReponseGroup()])
      )
    });
    this.onTypeChange(type);
  }

  creerReponseGroup(r?: ReponseDTO): FormGroup {
    return this.fb.group({
      id: [r?.id ?? null],
      texte: [r?.texte ?? '', Validators.required],
      estCorrecte: [r?.estCorrecte ?? false]
    });
  }

  reponsesPourVraiFaux(): FormGroup[] {
    return [
      this.fb.group({ id: [null], texte: ['Vrai'], estCorrecte: [true] }),
      this.fb.group({ id: [null], texte: ['Faux'], estCorrecte: [false] })
    ];
  }

  get reponses(): FormArray {
    return this.questionForm?.get('reponses') as FormArray;
  }

  onTypeChange(type: string): void {
    if (!this.questionForm) return;
    const repCtrl = this.reponses;
    if (type === 'VRAI_FAUX') {
      repCtrl.clear();
      this.reponsesPourVraiFaux().forEach(g => repCtrl.push(g));
      repCtrl.controls.forEach(c => c.get('texte')?.disable());
    } else {
      repCtrl.controls.forEach(c => c.get('texte')?.enable());
    }
  }

  ajouterReponse(): void {
    this.reponses.push(this.creerReponseGroup());
  }

  supprimerReponse(i: number): void {
    if (this.reponses.length > 2) this.reponses.removeAt(i);
  }

  ouvrirAjouterQuestion(): void {
    this.editingQuestion = null;
    this.buildQuestionForm();
    this.showQuestionModal = true;
  }

  ouvrirModifierQuestion(q: QuestionDTO): void {
    this.editingQuestion = q;
    this.buildQuestionForm(q);
    this.showQuestionModal = true;
  }

  fermerQuestionModal(): void {
    this.showQuestionModal = false;
    this.editingQuestion = null;
  }

  sauvegarderQuestion(): void {
    if (this.questionForm.invalid) { this.questionForm.markAllAsTouched(); return; }
    const v = this.questionForm.getRawValue();
    const dto: QuestionDTO = {
      texte: v.texte,
      type: v.type as TypeQuestion,
      reponses: v.reponses.map((rep: any) => ({
        ...rep,
        estCorrecte: rep.estCorrecte ?? false
      }))
    };

    this.questionLoading = true;
    const obs = this.editingQuestion?.id
      ? this.quizService.mettreAJourQuestion(this.editingQuestion.id, dto)
      : this.quizService.ajouterQuestion(this.quizSelectionne!.id!, dto);

    obs.subscribe({
      next: () => {
        this.showSuccess('Question sauvegardée.');
        this.questionLoading = false;
        this.fermerQuestionModal();
        // Rafraîchir les questions du quiz sélectionné
        this.quizService.getQuizById(this.quizSelectionne!.id!).subscribe(q => {
          this.quizSelectionne = q;
        });
        this.chargerMesQuiz();
      },
      error: (e) => { this.errorMsg = e.message; this.questionLoading = false; }
    });
  }

  // ── Suppression ───────────────────────────────────────────────────────────

  demanderSuppressionQuiz(quiz: QuizDTO): void {
    this.deleteTarget = { type: 'quiz', id: quiz.id!, nom: quiz.titre };
  }

  demanderSuppressionQuestion(q: QuestionDTO): void {
    this.deleteTarget = { type: 'question', id: q.id!, nom: q.texte };
  }

  confirmerSuppression(): void {
    if (!this.deleteTarget) return;
    const { type, id } = this.deleteTarget;
    const obs = type === 'quiz'
      ? this.quizService.supprimerQuiz(id)
      : this.quizService.supprimerQuestion(id);

    obs.subscribe({
      next: () => {
        this.showSuccess(`${type === 'quiz' ? 'Quiz' : 'Question'} supprimé(e).`);
        this.deleteTarget = null;
        if (type === 'quiz') {
          this.chargerMesQuiz();
          if (this.quizSelectionne?.id === id) this.fermerQuestionsModal();
        } else {
          this.quizService.getQuizById(this.quizSelectionne!.id!).subscribe(q => {
            this.quizSelectionne = q;
          });
          this.chargerMesQuiz();
        }
      },
      error: (e) => { this.errorMsg = e.message; this.deleteTarget = null; }
    });
  }

  annulerSuppression(): void { this.deleteTarget = null; }

  // ── Détails Quiz ─────────────────────────────────────────────────────────

  ouvrirDetails(quiz: QuizDTO): void {
    this.quizService.getQuizById(quiz.id!).subscribe({
      next: (q) => { this.quizDetails = q; this.showDetailsModal = true; },
      error: (e) => { this.errorMsg = e.message; }
    });
  }

  fermerDetails(): void { this.showDetailsModal = false; this.quizDetails = null; }

  // ── Utilitaires ───────────────────────────────────────────────────────────

  showSuccess(msg: string): void {
    this.successMsg = msg;
    this.errorMsg = '';
    setTimeout(() => { this.successMsg = ''; this.cdr.markForCheck(); }, 4000);
  }

  getNomCours(coursId: number): string {
    return this.mesCours.find(c => c.idCours === coursId)?.titre ?? `Cours #${coursId}`;
  }

  getControl(name: string): AbstractControl {
    return this.quizForm.get(name)!;
  }

  getQControl(name: string): AbstractControl {
    return this.questionForm.get(name)!;
  }
}
