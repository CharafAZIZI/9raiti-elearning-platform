import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormsModule, ReactiveFormsModule, FormBuilder, FormGroup,
  FormArray, Validators, AbstractControl
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { CoursInteractionComponent } from '../../components/cours-interaction/cours-interaction.component';
import { NotificationCenterComponent } from '../../components/notification-center/notification-center.component';
import { NotificationService } from '../../core/services/notification.service';
import { TokenService }     from '../../core/services/token.service';
import { UserStateService } from '../../core/services/user-state.service';
import { CatalogueService } from '../../core/services/catalogue.service';
import { InscriptionService } from '../../core/services/inscription.service';
import { QuizService }      from '../../core/services/quiz.service';
import { CategorieDTO }     from '../../models/categorie.model';
import { ModuleDTO, StatutModule } from '../../models/module.model';
import { CoursDTO, Niveau, StatutCours } from '../../models/cours.model';
import { ApprenantInscritDTO } from '../../models/apprenant-inscrit.model';
import { QuizDTO, QuestionDTO, ReponseDTO, TypeQuestion } from '../../models/quiz.model';

const ACCEPTED_MIME_TYPES = ['application/pdf','video/mp4','video/webm','video/ogg','video/avi','video/quicktime'];

@Component({
  selector: 'app-dashboard-enseignant',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavbarComponent, DatePipe, RouterModule, CoursInteractionComponent, NotificationCenterComponent],
  templateUrl: './dashboard-enseignant.component.html',
  styleUrls: ['./dashboard-enseignant.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardEnseignantComponent implements OnInit, OnDestroy {

  userName = ''; userEmail = ''; activeSection = 'accueil';
  enseignantConnecteId: number | null = null;

  stats = [
    { icon: '📘', value: '0', label: 'Cours publiés',      color: 'var(--blue)',   dim: 'var(--blue-dim)'   },
    { icon: '🗂',  value: '0', label: 'Catégories',         color: 'var(--green)',  dim: 'var(--green-dim)'  },
    { icon: '📦', value: '0', label: 'Modules',            color: 'var(--brand)',  dim: 'var(--brand-dim)'  },
    { icon: '👥', value: '–', label: 'Étudiants inscrits', color: 'var(--orange)', dim: 'var(--orange-dim)' },
    { icon: '🎯', value: '0', label: 'Quiz créés',         color: 'var(--purple)', dim: 'var(--purple-dim)' },
  ];

  categories: CategorieDTO[] = []; modules: ModuleDTO[] = []; cours: CoursDTO[] = [];
  loadingCategories = false; loadingModules = false; loadingCours = false;
  successMsg = ''; errorMsg = '';
  deleteTarget: { type: 'categorie'|'module'|'cours'; id: number; name: string } | null = null;

  showCatModal = false;   editingCat: CategorieDTO | null = null;   catForm!: FormGroup;   catLoading = false;
  showModModal = false;   editingMod: ModuleDTO | null = null;       modForm!: FormGroup;   modLoading = false;
  showCoursModal = false; editingCours: CoursDTO | null = null;      coursForm!: FormGroup; coursLoading = false;
  selectedFile: File | null = null; uploadingId: number | null = null; uploadLoading = false;
  niveaux: Niveau[] = ['DEBUTANT','INTERMEDIAIRE','AVANCE'];
  statuts: StatutCours[] = ['BROUILLON','PUBLIE','ARCHIVE'];

  contenuNiveau: 0|1|2 = 0;
  contenuCategorieSelectee: CategorieDTO | null = null;
  contenuModuleSelectionne: ModuleDTO | null = null;
  contenuModules: ModuleDTO[] = []; contenuCours: CoursDTO[] = [];
  contenuLoadingModules = false; contenuLoadingCours = false;

  mesApprenants: ApprenantInscritDTO[] = []; apprenantsDuModule: ApprenantInscritDTO[] = [];
  loadingApprenants = false; apprenantError = '';
  moduleSelectionneId: number | null = null; moduleSelectionneNom = ''; apprenantSearch = '';

  // ══════════════════════════════════════ QUIZ ══════════════════════════════════════
  mesQuiz: QuizDTO[] = []; loadingQuiz = false;
  showGenerationIAModal = false;
selectedPdfFile: File | null = null;
iaGenerationLoading = false;
iaForm!: FormGroup;

  // Modal création/édition quiz
  showQuizModal = false; editingQuiz: QuizDTO | null = null;
  quizForm!: FormGroup; quizLoading = false;

  // Modal gestion des questions
  showQuestionsModal = false; quizSelectionne: QuizDTO | null = null; questionsLoading = false;

  // Modal création/édition question
  showQuestionModal = false; editingQuestion: QuestionDTO | null = null;
  questionForm!: FormGroup; questionLoading = false;

  // Confirmation suppression quiz/question
  deleteQuizTarget: { type: 'quiz'|'question'; id: number; nom: string } | null = null;



  constructor(
    private tokenService:     TokenService,
    private userStateService: UserStateService,
    private catalogueService: CatalogueService,
    private fb:               FormBuilder,
    private inscriptionService: InscriptionService,
    private cdr:              ChangeDetectorRef,
    private notifService:     NotificationService,
    private quizService: QuizService,
  ) {}

  ngOnInit(): void {
    this.notifService.connect(); // ← connexion SSE temps réel
    this.userName  = this.tokenService.getDisplayName();

    this.userEmail = this.tokenService.getUser()?.email ?? '';
    this.enseignantConnecteId = this.tokenService.getEnseignantId();
    this.userStateService.user$.subscribe(() => {
      this.userName = this.userStateService.getDisplayName();
      this.userEmail = this.tokenService.getUser()?.email ?? '';
      this.enseignantConnecteId = this.tokenService.getEnseignantId();
    });
    this.buildForms();
    this.buildIAForm();
    this.loadAll();
    this.loadMesApprenants();
  }

  ngOnDestroy(): void { this.notifService.disconnect(); }
  // ─── Forms ──────────────────────────────────────────────────────────────────

  private buildForms(): void {
    this.catForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });
    this.modForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', Validators.required],
      code: ['', [Validators.required, Validators.pattern(/^[A-Z]{2,10}-\d+$/)]],
      actif: [true], statut: ['ACTIF'], categorieId: [null]
    });
    this.coursForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      niveau: ['DEBUTANT', Validators.required],
      statut: ['PUBLIE'], dureeMinutes: [null, [Validators.min(1)]], moduleId: [null, Validators.required]
    });
  }

private buildIAForm(): void {
  this.iaForm = this.fb.group({
    coursId: [null, Validators.required],
    nombreQuestions: [10, [Validators.required, Validators.min(1), Validators.max(50)]],
    difficulte: ['MOYEN', Validators.required],
    typeQuestions: ['QCM', Validators.required],
    titre: [''],
    correctionInstantanee: [false],
    randomiserQuestions: [false]
  });
}

  // ─── Chargement ─────────────────────────────────────────────────────────────

  loadAll(): void { this.loadCategories(); this.loadModules(); this.loadCours(); this.chargerMesQuiz(); }

  loadCategories(): void {
    this.loadingCategories = true;
    this.catalogueService.getAllCategories().subscribe({
      next: d => { this.categories=d; this.stats[1].value=String(d.length); this.loadingCategories=false; this.cdr.detectChanges(); },
      error: e => { this.loadingCategories=false; this.showError(this.extractError(e,'Impossible de charger les catégories.')); }
    });
  }

  loadModules(): void {
    this.loadingModules = true;
    this.catalogueService.getMesModules().subscribe({
      next: d => { this.modules=d; this.stats[2].value=String(d.length); this.loadingModules=false; this.cdr.detectChanges(); },
      error: e => { this.loadingModules=false; this.showError(this.extractError(e,'Impossible de charger les modules.')); }
    });
  }

  loadCours(): void {
    this.loadingCours = true;
    this.catalogueService.clearCache();
    this.catalogueService.getMesCours().subscribe({
      next: d => { this.cours=d; this.stats[0].value=String(d.filter(c=>c.statut==='PUBLIE').length); this.loadingCours=false; this.cdr.detectChanges(); },
      error: e => { this.loadingCours=false; this.showError(this.extractError(e,'Impossible de charger les cours.')); }
    });
  }

  // ─── Catégories CRUD ────────────────────────────────────────────────────────

  openCreateCat(): void { this.editingCat=null; this.catForm.reset({nom:'',description:''}); this.showCatModal=true; }
  openEditCat(cat: CategorieDTO): void { this.editingCat=cat; this.catForm.patchValue({nom:cat.nom,description:cat.description??''}); this.showCatModal=true; }
  submitCat(): void {
  if (this.catForm.invalid) { this.catForm.markAllAsTouched(); return; }
  this.catLoading = true;
  const obs = this.editingCat?.id
    ? this.catalogueService.updateCategorie(this.editingCat.id, this.catForm.value)
    : this.catalogueService.createCategorie(this.catForm.value);

  obs.subscribe({
    next: () => {
      this.catLoading = false;
      this.showCatModal = false;
      this.loadCategories(); // recharge la liste principale

      // Si on est dans la section contenu → recharger aussi les catégories du contenu
      if (this.contenuNiveau === 0) {
        this.catalogueService.getAllCategories().subscribe({
          next: d => { this.categories = d; this.cdr.detectChanges(); },
          error: () => {}
        });
      }

      this.showSuccess(this.editingCat ? 'Catégorie mise à jour.' : 'Catégorie créée.');
    },
    error: e => { this.catLoading = false; this.showError(this.extractError(e, 'Erreur.')); }
  });
}

  // ─── Modules CRUD ───────────────────────────────────────────────────────────

  openCreateMod(): void { this.editingMod=null; this.modForm.reset({nom:'',description:'',code:'',actif:true,statut:'ACTIF',categorieId:null}); this.showModModal=true; }
  openEditMod(mod: ModuleDTO): void { this.editingMod=mod; this.modForm.patchValue({nom:mod.nom,description:mod.description,code:mod.code,actif:mod.actif,statut:mod.statut??(mod.actif?'ACTIF':'BROUILLON'),categorieId:mod.categorieId??null}); this.showModModal=true; }
 submitMod(): void {
  if (this.modForm.invalid) { this.modForm.markAllAsTouched(); return; }
  this.modLoading = true;
  const val = this.modForm.value;
  const dto: ModuleDTO = { ...val, actif: val.statut === 'ACTIF' };
  const obs = this.editingMod?.id
    ? this.catalogueService.updateModule(this.editingMod.id, dto)
    : this.catalogueService.createModule(dto);

  obs.subscribe({
    next: () => {
      this.modLoading = false;
      this.showModModal = false;
      this.loadModules(); // recharge la liste principale

      // Si on est dans la section contenu et une catégorie est sélectionnée → recharger
      if (this.contenuNiveau >= 1 && this.contenuCategorieSelectee?.id) {
        this.contenuLoadingModules = true;
        this.catalogueService.getModulesByCategorie(this.contenuCategorieSelectee.id).subscribe({
          next: d => { this.contenuModules = d; this.contenuLoadingModules = false; this.cdr.detectChanges(); },
          error: () => { this.contenuLoadingModules = false; }
        });
      }

      this.showSuccess(this.editingMod ? 'Module mis à jour.' : 'Module créé.');
    },
    error: e => { this.modLoading = false; this.showError(this.extractError(e, 'Erreur.')); }
  });
}

  // ─── Cours CRUD ─────────────────────────────────────────────────────────────

  openCreateCours(): void { this.editingCours=null; this.coursForm.reset({titre:'',description:'',niveau:'DEBUTANT',statut:'PUBLIE',dureeMinutes:null,moduleId:null}); this.selectedFile=null; this.showCoursModal=true; }
  openEditCours(c: CoursDTO): void { this.editingCours=c; this.coursForm.patchValue({titre:c.titre,description:c.description,niveau:c.niveau,statut:c.statut??'BROUILLON',dureeMinutes:c.dureeMinutes??null,moduleId:c.moduleId}); this.selectedFile=null; this.showCoursModal=true; }
  submitCours(): void {
  if (this.coursForm.invalid) { this.coursForm.markAllAsTouched(); return; }
  this.coursLoading = true;
  const dto: CoursDTO = {
    titre: this.coursForm.value.titre,
    description: this.coursForm.value.description,
    niveau: this.coursForm.value.niveau,
    statut: this.coursForm.value.statut,
    dureeMinutes: this.coursForm.value.dureeMinutes || undefined,
    moduleId: Number(this.coursForm.value.moduleId)
  };
  const obs = this.editingCours?.idCours
    ? this.catalogueService.updateCours(this.editingCours.idCours, dto)
    : this.catalogueService.createCours(dto);

  obs.subscribe({
    next: created => {
      this.coursLoading = false;
      this.showCoursModal = false;

      if (this.selectedFile && created.idCours) {
        this.uploadFile(created.idCours, this.selectedFile);
      } else {
        this.loadCours(); // recharge liste principale
      }

      // Si on est dans la section contenu et un module est sélectionné → recharger
      if (this.contenuNiveau === 2 && this.contenuModuleSelectionne?.id) {
        this.contenuLoadingCours = true;
        this.catalogueService.getCoursByModule(this.contenuModuleSelectionne.id).subscribe({
          next: d => { this.contenuCours = d; this.contenuLoadingCours = false; this.cdr.detectChanges(); },
          error: () => { this.contenuLoadingCours = false; }
        });
      }

      this.showSuccess(this.editingCours ? 'Cours mis à jour.' : 'Cours créé.');
    },
    error: e => { this.coursLoading = false; this.showError(this.extractError(e, 'Erreur.')); }
  });
}

  onFileSelected(event: Event): void { const f=(event.target as HTMLInputElement).files?.[0]; if(!f)return; if(!ACCEPTED_MIME_TYPES.includes(f.type)){this.showError('Type non supporté.');this.selectedFile=null;return;} this.selectedFile=f; }
  openUpload(cours: CoursDTO): void { const i=document.createElement('input');i.type='file';i.accept='application/pdf,video/mp4,video/webm,video/ogg';i.onchange=e=>{const f=(e.target as HTMLInputElement).files?.[0];if(f&&cours.idCours)this.uploadFile(cours.idCours,f)};i.click(); }
  uploadFile(coursId: number, file: File): void {
  this.uploadLoading = true;
  this.uploadingId = coursId;
  this.catalogueService.uploadCoursFile(coursId, file).subscribe({
    next: () => {
      this.uploadLoading = false;
      this.uploadingId = null;
      this.selectedFile = null;
      this.loadCours(); // liste principale

      // Recharger contenuCours aussi
      if (this.contenuNiveau === 2 && this.contenuModuleSelectionne?.id) {
        this.catalogueService.getCoursByModule(this.contenuModuleSelectionne.id).subscribe({
          next: d => { this.contenuCours = d; this.cdr.detectChanges(); },
          error: () => {}
        });
      }

      this.showSuccess('Fichier uploadé.');
    },
    error: e => {
      this.uploadLoading = false;
      this.uploadingId = null;
      this.showError(this.extractError(e, 'Erreur upload.'));
    }
  });
}
  getFileIcon(cours: CoursDTO): string { if(!cours.filePath)return '';const p=cours.filePath.toLowerCase();if(p.endsWith('.pdf'))return '📄 PDF';if(p.includes('video')||p.endsWith('.mp4')||p.endsWith('.webm'))return '🎬 Vidéo';return '📎 Fichier'; }
  getViewUrl(cours: CoursDTO): string { return cours.idCours?`/cours/${cours.idCours}`:'#'; }

  // ─── Suppression catalogue ───────────────────────────────────────────────────

  confirmDelete(type:'categorie'|'module'|'cours',id:number,name:string): void { this.deleteTarget={type,id,name}; }
  cancelDelete(): void { this.deleteTarget=null; }
  executeDelete(): void {
  if (!this.deleteTarget) return;
  const { type, id } = this.deleteTarget;
  this.deleteTarget = null;

  const obs = type === 'categorie'
    ? this.catalogueService.deleteCategorie(id)
    : type === 'module'
      ? this.catalogueService.deleteModule(id)
      : this.catalogueService.deleteCours(id);

  obs.subscribe({
    next: () => {
      this.showSuccess('Supprimé(e).');

      if (type === 'categorie') {
        this.loadCategories();

      } else if (type === 'module') {
        this.loadModules();

        // Recharger contenuModules si on est dans la bonne catégorie
        if (this.contenuNiveau >= 1 && this.contenuCategorieSelectee?.id) {
          this.contenuLoadingModules = true;
          this.catalogueService.getModulesByCategorie(this.contenuCategorieSelectee.id).subscribe({
            next: d => { this.contenuModules = d; this.contenuLoadingModules = false; this.cdr.detectChanges(); },
            error: () => { this.contenuLoadingModules = false; }
          });
        }

      } else {
        this.loadCours();

        // Recharger contenuCours si on est dans le bon module
        if (this.contenuNiveau === 2 && this.contenuModuleSelectionne?.id) {
          this.contenuLoadingCours = true;
          this.catalogueService.getCoursByModule(this.contenuModuleSelectionne.id).subscribe({
            next: d => { this.contenuCours = d; this.contenuLoadingCours = false; this.cdr.detectChanges(); },
            error: () => { this.contenuLoadingCours = false; }
          });
        }
      }
    },
    error: e => this.showError(this.extractError(e, 'Erreur suppression.'))
  });
}

  // ─── Section Contenu ─────────────────────────────────────────────────────────

  ouvrirContenu(): void { this.contenuNiveau=0;this.contenuCategorieSelectee=null;this.contenuModuleSelectionne=null;this.setSection('contenu');if(this.categories.length===0)this.loadCategories(); }
  selectionnerCategorie(cat: CategorieDTO): void { this.contenuCategorieSelectee=cat;this.contenuModuleSelectionne=null;this.contenuNiveau=1;this.contenuLoadingModules=true;this.contenuModules=[];this.catalogueService.getModulesByCategorie(cat.id!).subscribe({ next:d=>{ this.contenuModules=d;this.contenuLoadingModules=false;this.cdr.detectChanges(); }, error:()=>{ this.contenuLoadingModules=false; } }); }
  selectionnerModule(mod: ModuleDTO): void { this.contenuModuleSelectionne=mod;this.contenuNiveau=2;this.contenuLoadingCours=true;this.contenuCours=[];this.catalogueService.getCoursByModule(mod.id!).subscribe({ next:d=>{ this.contenuCours=d;this.contenuLoadingCours=false;this.cdr.detectChanges(); }, error:()=>{ this.contenuLoadingCours=false; } }); }
  contenuRetourCategories(): void { this.contenuNiveau=0;this.contenuCategorieSelectee=null;this.contenuModuleSelectionne=null; }
  contenuRetourModules(): void { this.contenuNiveau=1;this.contenuModuleSelectionne=null; }

  // ══════════════════════════════════════ QUIZ ══════════════════════════════════════

  ouvrirSectionQuiz(): void { this.setSection('quiz'); this.chargerMesQuiz(); }

  chargerMesQuiz(): void {
    this.loadingQuiz = true;
    this.quizService.getMesQuiz().subscribe({
      next: d => { this.mesQuiz=d; this.stats[4].value=String(d.length); this.loadingQuiz=false; this.cdr.detectChanges(); },
      error: e => { this.loadingQuiz=false; this.showError(this.extractError(e,'Impossible de charger les quiz.')); }
    });
  }

  // ─ Quiz Form ─────────────────────────────────────────────────────────────────

  buildQuizForm(q?: QuizDTO): void {
    this.quizForm = this.fb.group({
      titre:                [q?.titre??'',   [Validators.required, Validators.minLength(3)]],
      description:          [q?.description??''],
      coursId:              [q?.coursId??null, Validators.required],
      actif:                [q?.actif??true],
      correctionInstantanee:[q?.config?.correctionInstantanee??false],
      tempsLimiteMinutes:   [q?.config?.tempsLimiteMinutes??null],
      randomiserQuestions:  [q?.config?.randomiserQuestions??false],
      randomiserReponses:   [q?.config?.randomiserReponses??false],
    });
  }

  ouvrirCreerQuiz(): void { this.editingQuiz=null; this.buildQuizForm(); this.showQuizModal=true; }
  ouvrirModifierQuiz(q: QuizDTO): void { this.editingQuiz=q; this.buildQuizForm(q); this.showQuizModal=true; }
  fermerQuizModal(): void { this.showQuizModal=false; this.editingQuiz=null; }

  sauvegarderQuiz(): void {
    if (this.quizForm.invalid) { this.quizForm.markAllAsTouched(); return; }
    const v = this.quizForm.value;
    const dto: QuizDTO = {
      titre: v.titre, description: v.description, coursId: Number(v.coursId), actif: v.actif,
      config: { correctionInstantanee:v.correctionInstantanee, tempsLimiteMinutes:v.tempsLimiteMinutes?Number(v.tempsLimiteMinutes):null, randomiserQuestions:v.randomiserQuestions, randomiserReponses:v.randomiserReponses }
    };
    this.quizLoading = true;
    const obs = this.editingQuiz?.id ? this.quizService.mettreAJourQuiz(this.editingQuiz.id,dto) : this.quizService.creerQuiz(dto);
    obs.subscribe({
      next: () => { this.quizLoading=false; this.fermerQuizModal(); this.chargerMesQuiz(); this.showSuccess(this.editingQuiz?'Quiz modifié.':'Quiz créé avec succès !'); },
      error: e => { this.quizLoading=false; this.showError(this.extractError(e,'Erreur lors de la sauvegarde du quiz.')); }
    });
  }

  // ─ Questions ─────────────────────────────────────────────────────────────────

  ouvrirQuestions(quiz: QuizDTO): void {
    this.questionsLoading = true;
    this.quizService.getQuizById(quiz.id!).subscribe({
      next: q => { this.quizSelectionne=q; this.questionsLoading=false; this.showQuestionsModal=true; this.cdr.detectChanges(); },
      error: e => { this.questionsLoading=false; this.showError(this.extractError(e,'Erreur.')); }
    });
  }
  fermerQuestionsModal(): void { this.showQuestionsModal=false; this.quizSelectionne=null; }

  buildQuestionForm(q?: QuestionDTO): void {
    const type = q?.type ?? 'QCM';
    this.questionForm = this.fb.group({
      texte: [q?.texte??'', [Validators.required, Validators.minLength(3)]],
      type:  [type, Validators.required],
      reponses: this.fb.array(
        q?.reponses?.length ? q.reponses.map(r=>this.creerReponseGroup(r)) :
        (type==='VRAI_FAUX' ? this.reponsesPourVraiFaux() : [this.creerReponseGroup(),this.creerReponseGroup()])
      )
    });
    this.onTypeChange(type);
  }

  creerReponseGroup(r?: ReponseDTO): FormGroup {
    return this.fb.group({ id:[r?.id??null], texte:[r?.texte??'', Validators.required], estCorrecte:[r?.estCorrecte??false] });
  }

  reponsesPourVraiFaux(): FormGroup[] {
    return [
      this.fb.group({id:[null],texte:['Vrai'],estCorrecte:[true]}),
      this.fb.group({id:[null],texte:['Faux'],estCorrecte:[false]})
    ];
  }

  get reponses(): FormArray { return this.questionForm?.get('reponses') as FormArray; }

  onTypeChange(type: string): void {
    if (!this.questionForm) return;
    if (type==='VRAI_FAUX') {
      this.reponses.clear();
      this.reponsesPourVraiFaux().forEach(g=>this.reponses.push(g));
      this.reponses.controls.forEach(c=>c.get('texte')?.disable());
    } else {
      this.reponses.controls.forEach(c=>c.get('texte')?.enable());
    }
  }

  ajouterReponse(): void { this.reponses.push(this.creerReponseGroup()); }
  supprimerReponseForm(i: number): void { if(this.reponses.length>2)this.reponses.removeAt(i); }
  ouvrirAjouterQuestion(): void { this.editingQuestion=null; this.buildQuestionForm(); this.showQuestionModal=true; }
  ouvrirModifierQuestion(q: QuestionDTO): void { this.editingQuestion=q; this.buildQuestionForm(q); this.showQuestionModal=true; }
  fermerQuestionModal(): void { this.showQuestionModal=false; this.editingQuestion=null; }

  sauvegarderQuestion(): void {
    if (this.questionForm.invalid) { this.questionForm.markAllAsTouched(); return; }
    const v = this.questionForm.getRawValue();
const dto: QuestionDTO = {
  texte: v.texte,
  type: v.type as TypeQuestion,
  ordre: 0,
  reponses: v.reponses.map((rep: any) => ({
    ...rep,
    estCorrecte: rep.estCorrecte ?? false 
  }))
};    this.questionLoading = true;
    const obs = this.editingQuestion?.id
      ? this.quizService.mettreAJourQuestion(this.editingQuestion.id,dto)
      : this.quizService.ajouterQuestion(this.quizSelectionne!.id!,dto);
    obs.subscribe({
      next: () => {
        this.questionLoading=false; this.fermerQuestionModal(); this.showSuccess('Question sauvegardée.');
        // Rafraîchir le quiz sélectionné
        this.quizService.getQuizById(this.quizSelectionne!.id!).subscribe(q=>{ this.quizSelectionne=q; this.cdr.detectChanges(); });
        this.chargerMesQuiz();
      },
      error: e => { this.questionLoading=false; this.showError(this.extractError(e,'Erreur lors de la sauvegarde de la question.')); }
    });
  }

  // ─ Suppression quiz/question ──────────────────────────────────────────────────

  demanderSuppressionQuiz(quiz: QuizDTO): void { this.deleteQuizTarget={type:'quiz',id:quiz.id!,nom:quiz.titre}; }
  demanderSuppressionQuestion(q: QuestionDTO): void { this.deleteQuizTarget={type:'question',id:q.id!,nom:q.texte}; }
  annulerSuppressionQuiz(): void { this.deleteQuizTarget=null; }
  confirmerSuppressionQuiz(): void {
    if (!this.deleteQuizTarget) return;
    const {type,id} = this.deleteQuizTarget;
    const obs = type==='quiz' ? this.quizService.supprimerQuiz(id) : this.quizService.supprimerQuestion(id);
    obs.subscribe({
      next: () => {
        this.showSuccess(`${type==='quiz'?'Quiz':'Question'} supprimé(e).`);
        this.deleteQuizTarget=null;
        if (type==='quiz') { this.chargerMesQuiz(); if(this.quizSelectionne?.id===id)this.fermerQuestionsModal(); }
        else { this.quizService.getQuizById(this.quizSelectionne!.id!).subscribe(q=>{ this.quizSelectionne=q; this.cdr.detectChanges(); }); this.chargerMesQuiz(); }
      },
      error: e => { this.deleteQuizTarget=null; this.showError(this.extractError(e,'Erreur.')); }
    });
  }

  getNomCours(coursId: number): string { return this.cours.find(c=>c.idCours===coursId)?.titre??`Cours #${coursId}`; }
  getQControl(name: string): AbstractControl { return this.questionForm.get(name)!; }
  getQuizControl(name: string): AbstractControl { return this.quizForm.get(name)!; }

  // ─── Apprenants ──────────────────────────────────────────────────────────────

  loadMesApprenants(): void {
    this.loadingApprenants=true; this.apprenantError='';
    this.inscriptionService.getMesApprenants().subscribe({
      next:d=>{ this.mesApprenants=d;this.loadingApprenants=false;this.cdr.detectChanges(); },
      error:e=>{ this.apprenantError=e.message??'Erreur.';this.loadingApprenants=false;this.cdr.detectChanges(); }
    });
  }
  chargerApprenantsDuModule(moduleId: number, moduleNom: string): void {
    this.moduleSelectionneId=moduleId;this.moduleSelectionneNom=moduleNom;this.apprenantSearch='';this.loadingApprenants=true;this.apprenantError='';
    this.inscriptionService.getApprenantsDuModule(moduleId).subscribe({
      next:d=>{ this.apprenantsDuModule=d;this.loadingApprenants=false;this.cdr.detectChanges(); },
      error:e=>{ this.apprenantError=e.message??'Erreur.';this.loadingApprenants=false;this.cdr.detectChanges(); }
    });
  }
  fermerDetailApprenants(): void { this.moduleSelectionneId=null;this.moduleSelectionneNom='';this.apprenantsDuModule=[];this.apprenantSearch=''; }
  get apprenantsFiltres(): ApprenantInscritDTO[] {
    const l=this.moduleSelectionneId?this.apprenantsDuModule:this.mesApprenants;
    if(!this.apprenantSearch.trim())return l;
    const q=this.apprenantSearch.toLowerCase();
    return l.filter(a=>String(a.apprenantId).includes(q)||a.moduleNom.toLowerCase().includes(q)||a.moduleCode.toLowerCase().includes(q));
  }
  getNbApprenantsDuModule(moduleId: number): number { return this.mesApprenants.filter(a=>a.moduleId===moduleId).length; }

  // ══════════════════════════════════════ GÉNÉRATION IA ══════════════════════════

ouvrirGenerationIA(): void {
  console.log('🔥 BOUTON CLIQUÉ - Ouverture modal IA');
  this.selectedPdfFile = null;
  this.iaForm.reset({
    coursId: null,
    nombreQuestions: 10,
    difficulte: 'MOYEN',
    typeQuestions: 'QCM',
    titre: '',
    correctionInstantanee: false,
    randomiserQuestions: false
  });
  this.showGenerationIAModal = true;
  console.log('✅ showGenerationIAModal =', this.showGenerationIAModal);
  this.cdr.detectChanges();
}

fermerGenerationIA(): void {
  this.showGenerationIAModal = false;
  this.selectedPdfFile = null;
  this.iaGenerationLoading = false;
}

onPdfSelected(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  
  if (file.type !== 'application/pdf') {
    this.showError('⚠️ Veuillez sélectionner un fichier PDF valide.');
    this.selectedPdfFile = null;
    return;
  }
  
  // Limite de taille : 20 MB
  if (file.size > 20 * 1024 * 1024) {
    this.showError('⚠️ Le fichier PDF est trop volumineux (max 20 MB).');
    this.selectedPdfFile = null;
    return;
  }
  
  this.selectedPdfFile = file;
}
genererQuizIA(): void {
  console.log('PDF file:', this.selectedPdfFile);
  console.log('Form values:', this.iaForm.value);

  if (this.iaForm.invalid || !this.selectedPdfFile) {
    this.iaForm.markAllAsTouched();
    this.showError('Veuillez remplir tous les champs et sélectionner un PDF.');
    return;
  }

  const values = this.iaForm.value;
  
  // ✅ Capturer le fichier AVANT de fermer le modal
  const pdfFile = this.selectedPdfFile;

  // ✅ Fermer le modal maintenant
  this.fermerGenerationIA();

  this.showSuccess('🤖 Génération du quiz en cours...');

  // ✅ Utiliser pdfFile (pas this.selectedPdfFile qui est null maintenant)
  this.quizService.genererQuizParIA(
    pdfFile,
    values.coursId,
    values.nombreQuestions,
    values.difficulte,
    values.typeQuestions,
    {
      titre: values.titre || undefined,
      correctionInstantanee: values.correctionInstantanee,
      randomiserQuestions: values.randomiserQuestions
    }
  ).subscribe({
    next: (response) => {
      this.showSuccess(`✅ Quiz généré avec succès !`);
      this.chargerMesQuiz();
      this.cdr.detectChanges();
    },
    error: (error) => {
      this.showError(`❌ Erreur : ${error.message}`);
      this.cdr.detectChanges();
    }
  });
}  // ─── Helpers ─────────────────────────────────────────────────────────────────

  setSection(s: string): void { this.activeSection=s; }
  getCatName(id?: number): string { if(!id)return'–';return this.categories.find(c=>c.id===id)?.nom??'–'; }
  getModName(id?: number): string { if(!id)return'–';return this.modules.find(m=>m.id===id)?.nom??this.contenuModules.find(m=>m.id===id)?.nom??'–'; }
  isMonModule(mod: ModuleDTO): boolean { return this.enseignantConnecteId!==null&&mod.enseignantId===this.enseignantConnecteId; }
  isMonCours(c: CoursDTO): boolean { return this.enseignantConnecteId!==null&&c.enseignantId===this.enseignantConnecteId; }
  getNiveauColor(n?: Niveau): string { if(n==='DEBUTANT')return'var(--green)';if(n==='INTERMEDIAIRE')return'var(--brand)';return'var(--red)'; }
  getNiveauDim(n?: Niveau): string { if(n==='DEBUTANT')return'var(--green-dim)';if(n==='INTERMEDIAIRE')return'var(--brand-dim)';return'var(--red-dim)'; }
  getStatutCls(s?: StatutCours): string { if(s==='PUBLIE')return'b-green';if(s==='ARCHIVE')return'b-red';return'b-orange'; }
  private showSuccess(msg: string): void { this.successMsg=msg;this.errorMsg='';setTimeout(()=>{this.successMsg='';this.cdr.detectChanges();},4000); }
  private showError(msg: string): void { this.errorMsg=msg;this.successMsg='';setTimeout(()=>{this.errorMsg='';this.cdr.detectChanges();},5000); }
  private extractError(err: any, fallback: string): string { return err?.error?.message??err?.error?.error??err?.message??fallback; }
  get cf() { return this.catForm.controls; }
  get mf() { return this.modForm.controls; }
  get ff() { return this.coursForm.controls; }
  private _colors=[{color:'var(--blue)',dim:'var(--blue-dim)',icon:'💻'},{color:'var(--brand)',dim:'var(--brand-dim)',icon:'🎯'},{color:'var(--green)',dim:'var(--green-dim)',icon:'🔬'},{color:'var(--orange)',dim:'var(--orange-dim)',icon:'📐'},{color:'var(--purple)',dim:'var(--purple-dim)',icon:'🌐'}];
  getCatStyle(i: number) { return this._colors[i%this._colors.length]; }
  getModColor(i: number) { return this._colors[i%this._colors.length]; }
  getModStatutStyle(mod: ModuleDTO): {bg:string;border:string;color:string;label:string} { const s=mod.statut??(mod.actif?'ACTIF':'BROUILLON');const m:Record<string,any>={ACTIF:{bg:'var(--green-dim)',border:'var(--green)',color:'var(--green)',label:'✅ ACTIF'},BROUILLON:{bg:'var(--blue-dim)',border:'var(--blue)',color:'var(--blue)',label:'📝 BROUILLON'},ARCHIVE:{bg:'var(--surface-2)',border:'var(--border)',color:'var(--text-3)',label:'📦 ARCHIVÉ'}};return m[s]??m['BROUILLON']; }
  getCoursStatutStyle(statut?: string): {bg:string;border:string;color:string;label:string} { const m:Record<string,any>={PUBLIE:{bg:'var(--green-dim)',border:'var(--green)',color:'var(--green)',label:'🟢 Publié'},BROUILLON:{bg:'var(--blue-dim)',border:'var(--blue)',color:'var(--blue)',label:'📝 Brouillon'},ARCHIVE:{bg:'var(--surface-2)',border:'var(--border)',color:'var(--text-3)',label:'📦 Archivé'}};return m[statut??'']??m['BROUILLON']; }
  getNiveauStyle(n?: string): {bg:string;color:string;label:string} { const m:Record<string,any>={DEBUTANT:{bg:'var(--green-dim)',color:'var(--green)',label:'🟢 Débutant'},INTERMEDIAIRE:{bg:'var(--orange-dim)',color:'var(--orange)',label:'🟡 Intermédiaire'},AVANCE:{bg:'var(--red-dim)',color:'var(--red)',label:'🔴 Avancé'}};return m[n??'']??m['DEBUTANT']; }
  formatDureeEns(min?: number): string { if(!min)return'—';const h=Math.floor(min/60),m=min%60;return h>0?(m>0?`${h}h ${m}min`:`${h}h`):`${min} min`; }
  formatDateEns(d?: string): string { if(!d)return'—';return new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}); }
  isPdf(filePath?: string): boolean { return !!filePath&&filePath.toLowerCase().endsWith('.pdf'); }
}
