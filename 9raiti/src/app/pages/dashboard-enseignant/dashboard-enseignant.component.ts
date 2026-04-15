import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { TokenService } from '../../core/services/token.service';
import { UserStateService } from '../../core/services/user-state.service';
import { CatalogueService } from '../../core/services/catalogue.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { CategorieDTO } from '../../models/categorie.model';
import { ModuleDTO, StatutModule } from '../../models/module.model';
import { CoursDTO, Niveau, StatutCours } from '../../models/cours.model';
import { FeedbackDTO, TypeAvis, TYPE_AVIS_LABELS, STATUT_LABELS, STATUT_BADGE } from '../../models/feedback.model';

// Types de fichiers acceptés
const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/avi',
  'video/quicktime',
];

@Component({
  selector: 'app-dashboard-enseignant',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavbarComponent, DatePipe, RouterModule],
  templateUrl: './dashboard-enseignant.component.html',
  styleUrls: ['./dashboard-enseignant.component.css']
})
export class DashboardEnseignantComponent implements OnInit {

  userName      = '';
  userEmail     = '';
  activeSection = 'accueil';

  stats = [
    { icon: '📘', value: '0', label: 'Cours publiés',       color: 'var(--blue)',   dim: 'var(--blue-dim)'   },
    { icon: '🗂',  value: '0', label: 'Catégories',          color: 'var(--green)',  dim: 'var(--green-dim)'  },
    { icon: '📦', value: '0', label: 'Modules',             color: 'var(--brand)',  dim: 'var(--brand-dim)'  },
    { icon: '👥', value: '–', label: 'Étudiants inscrits',  color: 'var(--orange)', dim: 'var(--orange-dim)' },
  ];

  categories: CategorieDTO[] = [];
  modules:    ModuleDTO[]    = [];
  cours:      CoursDTO[]     = [];

  loadingCategories = false;
  loadingModules    = false;
  loadingCours      = false;

  successMsg = '';
  errorMsg   = '';

  deleteTarget: { type: 'categorie' | 'module' | 'cours'; id: number; name: string } | null = null;

  // ── Catégorie CRUD ──
  showCatModal = false;
  editingCat: CategorieDTO | null = null;
  catForm!: FormGroup;
  catLoading = false;

  // ── Module CRUD ──
  showModModal = false;
  editingMod: ModuleDTO | null = null;
  modForm!: FormGroup;
  modLoading = false;

  // ── Cours CRUD ──
  showCoursModal = false;
  editingCours: CoursDTO | null = null;
  coursForm!: FormGroup;
  coursLoading = false;

  // ── Upload fichier (PDF ou vidéo) ──
  selectedFile: File | null = null;
  uploadingId: number | null = null;
  uploadLoading = false;
  fileAcceptLabel = 'PDF ou vidéo (mp4, webm…)';

  niveaux:  Niveau[]      = ['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'];
  statuts:  StatutCours[] = ['BROUILLON', 'PUBLIE', 'ARCHIVE'];

  // ── Feedback (envoi) ────────────────────────────────────────────────────────
  showFeedbackModal   = false;
  feedbackCoursId: number | null = null;
  fbEmail   = '';
  fbType: TypeAvis | '' = '';
  fbMessage = '';
  fbLoading = false;
  fbSuccess = '';
  fbError   = '';

  readonly typesAvis: { value: TypeAvis; label: string }[] =
    Object.entries(TYPE_AVIS_LABELS).map(([v, l]) => ({ value: v as TypeAvis, label: l }));

  // ── Avis reçus (lecture) ───────────────────────────────────────────────────
  avisCoursLoading  = false;
  avisCoursListe:   FeedbackDTO[] = [];
  avisCoursCourant: number | null = null;

  constructor(
    private tokenService: TokenService,
    private userStateService: UserStateService,
    private catalogueService: CatalogueService,
    private feedbackService: FeedbackService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userName  = this.tokenService.getDisplayName();
    this.userEmail = this.tokenService.getUser()?.email ?? '';
    this.userStateService.user$.subscribe(() => {
      this.userName  = this.userStateService.getDisplayName();
      this.userEmail = this.tokenService.getUser()?.email ?? '';
    });
    this.buildForms();
    this.loadAll();
  }

  // ── Build forms ─────────────────────────────────────────────────────────────

  private buildForms(): void {
    this.catForm = this.fb.group({
      nom:         ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
    });

    this.modForm = this.fb.group({
      nom:         ['', [Validators.required, Validators.minLength(2)]],
      description: ['', Validators.required],
      code:        ['', [Validators.required, Validators.pattern(/^[A-Z]{2,10}-\d+$/)]],
      actif:       [true],
      statut:      ['ACTIF'],
      categorieId: [null],
    });

    this.coursForm = this.fb.group({
      titre:        ['', [Validators.required, Validators.minLength(3)]],
      description:  ['', Validators.required],
      niveau:       ['DEBUTANT', Validators.required],
      statut:       ['BROUILLON'],
      dureeMinutes: [null, [Validators.min(1)]],
      moduleId:     [null, Validators.required],
    });
  }

  // ── Load data ────────────────────────────────────────────────────────────────

  loadAll(): void {
    this.loadCategories();
    this.loadModules();
    this.loadCours();
  }

  loadCategories(): void {
    this.loadingCategories = true;
    this.catalogueService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.stats[1].value = String(data.length);
        this.loadingCategories = false;
        this.cdr.detectChanges();
      },
      error: (err) => { this.loadingCategories = false; this.showError(this.extractError(err, 'Impossible de charger les catégories.')); }
    });
  }

  loadModules(): void {
    this.loadingModules = true;
    this.catalogueService.getAllModules().subscribe({
      next: (data) => {
        this.modules = data;
        this.stats[2].value = String(data.length);
        this.loadingModules = false;
        this.cdr.detectChanges();
      },
      error: (err) => { this.loadingModules = false; this.showError(this.extractError(err, 'Impossible de charger les modules.')); }
    });
  }

  loadCours(): void {
    this.loadingCours = true;
    this.catalogueService.clearCache();
    this.catalogueService.getAllCours().subscribe({
      next: (data) => {
        this.cours = data;
        this.stats[0].value = String(data.filter(c => c.statut === 'PUBLIE').length);
        this.loadingCours = false;
        this.cdr.detectChanges();
      },
      error: (err) => { this.loadingCours = false; this.showError(this.extractError(err, 'Impossible de charger les cours.')); }
    });
  }

  // ── Catégories CRUD ─────────────────────────────────────────────────────────

  openCreateCat(): void {
    this.editingCat = null;
    this.catForm.reset({ nom: '', description: '' });
    this.showCatModal = true;
  }

  openEditCat(cat: CategorieDTO): void {
    this.editingCat = cat;
    this.catForm.patchValue({ nom: cat.nom, description: cat.description ?? '' });
    this.showCatModal = true;
  }

  submitCat(): void {
    if (this.catForm.invalid) { this.catForm.markAllAsTouched(); return; }
    this.catLoading = true;
    const dto: CategorieDTO = this.catForm.value;
    const obs = this.editingCat?.id
      ? this.catalogueService.updateCategorie(this.editingCat.id, dto)
      : this.catalogueService.createCategorie(dto);
    obs.subscribe({
      next: () => { this.catLoading = false; this.showCatModal = false; this.loadCategories(); this.showSuccess(this.editingCat ? 'Catégorie mise à jour.' : 'Catégorie créée.'); },
      error: (err) => { this.catLoading = false; this.showError(this.extractError(err, 'Erreur lors de la sauvegarde.')); }
    });
  }

  // ── Modules CRUD ────────────────────────────────────────────────────────────

  openCreateMod(): void {
    this.editingMod = null;
    this.modForm.reset({ nom: '', description: '', code: '', actif: true, statut: 'ACTIF', categorieId: null });
    this.showModModal = true;
  }

  openEditMod(mod: ModuleDTO): void {
    this.editingMod = mod;
    const statut = mod.statut ?? (mod.actif ? 'ACTIF' : 'BROUILLON');
    this.modForm.patchValue({ nom: mod.nom, description: mod.description, code: mod.code, actif: mod.actif, statut, categorieId: mod.categorieId ?? null });
    this.showModModal = true;
  }

  submitMod(): void {
    if (this.modForm.invalid) { this.modForm.markAllAsTouched(); return; }
    this.modLoading = true;
    const val = this.modForm.value;
    const actif = val.statut === 'ACTIF';
    const dto: ModuleDTO = { ...val, actif };
    const obs = this.editingMod?.id
      ? this.catalogueService.updateModule(this.editingMod.id, dto)
      : this.catalogueService.createModule(dto);
    obs.subscribe({
      next: () => { this.modLoading = false; this.showModModal = false; this.loadModules(); this.showSuccess(this.editingMod ? 'Module mis à jour.' : 'Module créé.'); },
      error: (err) => { this.modLoading = false; this.showError(this.extractError(err, 'Erreur lors de la sauvegarde.')); }
    });
  }

  // ── Cours CRUD ──────────────────────────────────────────────────────────────

  openCreateCours(): void {
    this.editingCours = null;
    this.coursForm.reset({ titre: '', description: '', niveau: 'DEBUTANT', statut: 'BROUILLON', dureeMinutes: null, moduleId: null });
    this.selectedFile = null;
    this.showCoursModal = true;
  }

  openEditCours(c: CoursDTO): void {
    this.editingCours = c;
    this.coursForm.patchValue({ titre: c.titre, description: c.description, niveau: c.niveau, statut: c.statut ?? 'BROUILLON', dureeMinutes: c.dureeMinutes ?? null, moduleId: c.moduleId });
    this.selectedFile = null;
    this.showCoursModal = true;
  }

  submitCours(): void {
    if (this.coursForm.invalid) { this.coursForm.markAllAsTouched(); return; }
    this.coursLoading = true;
    const dto: CoursDTO = {
      titre:        this.coursForm.value.titre,
      description:  this.coursForm.value.description,
      niveau:       this.coursForm.value.niveau,
      statut:       this.coursForm.value.statut,
      dureeMinutes: this.coursForm.value.dureeMinutes || undefined,
      moduleId:     Number(this.coursForm.value.moduleId),
    };
    const obs = this.editingCours?.idCours
      ? this.catalogueService.updateCours(this.editingCours.idCours, dto)
      : this.catalogueService.createCours(dto);
    obs.subscribe({
      next: (created) => {
        this.coursLoading   = false;
        this.showCoursModal = false;
        if (this.selectedFile && created.idCours) {
          this.uploadFile(created.idCours, this.selectedFile);
        } else {
          this.loadCours();
        }
        this.showSuccess(this.editingCours ? 'Cours mis à jour.' : 'Cours créé avec succès.');
      },
      error: (err) => { this.coursLoading = false; this.showError(this.extractError(err, 'Erreur lors de la sauvegarde.')); }
    });
  }

  // ── Upload fichier ───────────────────────────────────────────────────────────

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      this.showError(`Type non supporté : ${file.type}. Acceptés : PDF, MP4, WEBM, OGG.`);
      this.selectedFile = null;
      return;
    }
    this.selectedFile = file;
  }

  openUpload(cours: CoursDTO): void {
    const input = document.createElement('input');
    input.type  = 'file';
    input.accept = 'application/pdf,video/mp4,video/webm,video/ogg,video/avi';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && cours.idCours) this.uploadFile(cours.idCours, file);
    };
    input.click();
  }

  uploadFile(coursId: number, file: File): void {
    this.uploadLoading = true;
    this.uploadingId   = coursId;
    this.catalogueService.uploadCoursFile(coursId, file).subscribe({
      next: () => {
        this.uploadLoading = false;
        this.uploadingId   = null;
        this.selectedFile  = null;
        this.loadCours();
        const type = file.type.startsWith('video/') ? 'Vidéo' : 'PDF';
        this.showSuccess(`${type} uploadé avec succès.`);
      },
      error: (err) => {
        this.uploadLoading = false;
        this.uploadingId   = null;
        this.showError(this.extractError(err, "Erreur lors de l'upload du fichier."));
      }
    });
  }

  getFileIcon(cours: CoursDTO): string {
    if (!cours.filePath) return '';
    const p = cours.filePath.toLowerCase();
    if (p.endsWith('.pdf')) return '📄 PDF';
    if (p.includes('video') || p.endsWith('.mp4') || p.endsWith('.webm')) return '🎬 Vidéo';
    return '📎 Fichier';
  }

  isPdf(filePath?: string): boolean {
    return !!filePath && filePath.toLowerCase().endsWith('.pdf');
  }

  getViewUrl(cours: CoursDTO): string {
    return cours.idCours ? `/cours/${cours.idCours}` : '#';
  }

  // ── Suppression ──────────────────────────────────────────────────────────────

  confirmDelete(type: 'categorie' | 'module' | 'cours', id: number, name: string): void {
    this.deleteTarget = { type, id, name };
  }

  cancelDelete(): void { this.deleteTarget = null; }

  executeDelete(): void {
    if (!this.deleteTarget) return;
    const { type, id } = this.deleteTarget;
    this.deleteTarget  = null;
    const obs =
      type === 'categorie' ? this.catalogueService.deleteCategorie(id) :
      type === 'module'    ? this.catalogueService.deleteModule(id)    :
                             this.catalogueService.deleteCours(id);
    obs.subscribe({
      next: () => {
        this.showSuccess(`${type === 'categorie' ? 'Catégorie' : type === 'module' ? 'Module' : 'Cours'} supprimé(e).`);
        if (type === 'categorie') this.loadCategories();
        else if (type === 'module') this.loadModules();
        else this.loadCours();
      },
      error: (err) => this.showError(this.extractError(err, 'Erreur lors de la suppression.'))
    });
  }

  // ── Feedback : envoi ────────────────────────────────────────────────────────

  ouvrirFeedbackGlobal(): void {
    this.feedbackCoursId = null;
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

    const dto: FeedbackDTO = {
      email:    this.userEmail || this.fbEmail,
      typeAvis: this.fbType as TypeAvis,
      message:  this.fbMessage,
      coursId:  this.feedbackCoursId ?? undefined,
    };

    this.feedbackService.soumettreAuthentifie(dto).subscribe({
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

  // ── Avis reçus sur un cours ─────────────────────────────────────────────────

  chargerAvisCours(coursId: number): void {
    this.avisCoursCourant = coursId;
    this.avisCoursLoading = true;
    this.avisCoursListe   = [];
    this.feedbackService.getByCours(coursId).subscribe({
      next: (liste) => {
        this.avisCoursListe   = liste;
        this.avisCoursLoading = false;
        this.setSection('avis-cours');
        this.cdr.detectChanges();
      },
      error: () => { this.avisCoursLoading = false; }
    });
  }

  getTypeLabel(type: string): string   { return (TYPE_AVIS_LABELS as any)[type] ?? type; }
  getStatutLabel(s: string): string    { return (STATUT_LABELS as any)[s] ?? s; }
  getStatutBadgeColor(s: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: 'var(--orange)', EN_COURS: 'var(--blue)',
      RESOLU: 'var(--green)',      REJETE:  'var(--red)',
    };
    return map[s] ?? 'var(--text-3)';
  }
  getStatutBadgeDim(s: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: 'var(--orange-dim)', EN_COURS: 'var(--blue-dim)',
      RESOLU: 'var(--green-dim)',      REJETE:  'var(--red-dim)',
    };
    return map[s] ?? 'var(--surface-2)';
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  setSection(s: string): void { this.activeSection = s; }

  getCatName(id?: number): string {
    if (!id) return '–';
    return this.categories.find(c => c.id === id)?.nom ?? '–';
  }

  getModName(id?: number): string {
    if (!id) return '–';
    return this.modules.find(m => m.id === id)?.nom ?? '–';
  }

  getNiveauColor(n: Niveau | undefined): string {
    if (n === 'DEBUTANT')      return 'var(--green)';
    if (n === 'INTERMEDIAIRE') return 'var(--brand)';
    return 'var(--red)';
  }

  getNiveauDim(n: Niveau | undefined): string {
    if (n === 'DEBUTANT')      return 'var(--green-dim)';
    if (n === 'INTERMEDIAIRE') return 'var(--brand-dim)';
    return 'var(--red-dim)';
  }

  getStatutCls(s: StatutCours | undefined): string {
    if (s === 'PUBLIE')  return 'b-green';
    if (s === 'ARCHIVE') return 'b-red';
    return 'b-orange';
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg; this.errorMsg = '';
    setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 4000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg; this.successMsg = '';
    setTimeout(() => { this.errorMsg = ''; this.cdr.detectChanges(); }, 5000);
  }

  private extractError(err: any, fallback: string): string {
    return err?.error?.message ?? err?.error?.error ?? err?.message ?? fallback;
  }

  get cf() { return this.catForm.controls;   }
  get mf() { return this.modForm.controls;   }
  get ff() { return this.coursForm.controls; }
}
