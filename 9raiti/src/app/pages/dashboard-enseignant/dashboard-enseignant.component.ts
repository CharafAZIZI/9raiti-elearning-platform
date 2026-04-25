import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { TokenService } from '../../core/services/token.service';
import { UserStateService } from '../../core/services/user-state.service';
import { CatalogueService } from '../../core/services/catalogue.service';
import { InscriptionService } from '../../core/services/inscription.service';
import { CategorieDTO } from '../../models/categorie.model';
import { ModuleDTO, StatutModule } from '../../models/module.model';
import { CoursDTO, Niveau, StatutCours } from '../../models/cours.model';
import { ApprenantInscritDTO } from '../../models/apprenant-inscrit.model';

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

  enseignantConnecteId: number | null = null;

  stats = [
    { icon: '📘', value: '0', label: 'Cours publiés',      color: 'var(--blue)',   dim: 'var(--blue-dim)'   },
    { icon: '🗂',  value: '0', label: 'Catégories',         color: 'var(--green)',  dim: 'var(--green-dim)'  },
    { icon: '📦', value: '0', label: 'Modules',            color: 'var(--brand)',  dim: 'var(--brand-dim)'  },
    { icon: '👥', value: '–', label: 'Étudiants inscrits', color: 'var(--orange)', dim: 'var(--orange-dim)' },
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

  // ── Upload fichier ──
  selectedFile: File | null = null;
  uploadingId: number | null = null;
  uploadLoading = false;

  niveaux:  Niveau[]      = ['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'];
  statuts:  StatutCours[] = ['BROUILLON', 'PUBLIE', 'ARCHIVE'];

  // ── Section Contenu ──
  contenuNiveau: 0 | 1 | 2 = 0;
  contenuCategorieSelectee: CategorieDTO | null = null;
  contenuModuleSelectionne: ModuleDTO | null    = null;
  contenuModules: ModuleDTO[] = [];
  contenuCours:   CoursDTO[]  = [];
  contenuLoadingModules = false;
  contenuLoadingCours   = false;


  // ── Mes Apprenants ──────────────────────────────────────────────────────────
  mesApprenants:        ApprenantInscritDTO[] = [];
  apprenantsDuModule:   ApprenantInscritDTO[] = [];
  loadingApprenants     = false;
  apprenantError        = '';
  /** moduleId sélectionné pour voir ses apprenants */
  moduleSelectionneId:  number | null = null;
  moduleSelectionneNom: string = '';
  /** Recherche dans la liste d'apprenants */
  apprenantSearch       = '';

  constructor(
    private tokenService:     TokenService,
    private userStateService: UserStateService,
    private catalogueService: CatalogueService,
    private fb:               FormBuilder,
    private inscriptionService: InscriptionService,
    private cdr:              ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userName  = this.tokenService.getDisplayName();
    this.userEmail = this.tokenService.getUser()?.email ?? '';
    this.enseignantConnecteId = this.tokenService.getEnseignantId();
    this.userStateService.user$.subscribe(() => {
      this.userName  = this.userStateService.getDisplayName();
      this.userEmail = this.tokenService.getUser()?.email ?? '';
      this.enseignantConnecteId = this.tokenService.getEnseignantId();
    });
    this.buildForms();
    this.loadAll();
    this.loadMesApprenants();
  }

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
      statut:       ['PUBLIE'],
      dureeMinutes: [null, [Validators.min(1)]],
      moduleId:     [null, Validators.required],
    });
  }

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
    this.catalogueService.getMesModules().subscribe({
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
    this.catalogueService.getMesCours().subscribe({
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
    this.coursForm.reset({ titre: '', description: '', niveau: 'DEBUTANT', statut: 'PUBLIE', dureeMinutes: null, moduleId: null });
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

  // ── Section Contenu ──────────────────────────────────────────────────────────

  ouvrirContenu(): void {
    this.contenuNiveau = 0;
    this.contenuCategorieSelectee = null;
    this.contenuModuleSelectionne = null;
    this.setSection('contenu');
    if (this.categories.length === 0) this.loadCategories();
  }

  selectionnerCategorie(cat: CategorieDTO): void {
    this.contenuCategorieSelectee = cat;
    this.contenuModuleSelectionne = null;
    this.contenuNiveau = 1;
    this.contenuLoadingModules = true;
    this.contenuModules = [];
    this.catalogueService.getModulesByCategorie(cat.id!).subscribe({
      next: (data) => { this.contenuModules = data; this.contenuLoadingModules = false; this.cdr.detectChanges(); },
      error: ()     => { this.contenuLoadingModules = false; }
    });
  }

  selectionnerModule(mod: ModuleDTO): void {
    this.contenuModuleSelectionne = mod;
    this.contenuNiveau = 2;
    this.contenuLoadingCours = true;
    this.contenuCours = [];
    this.catalogueService.getCoursByModule(mod.id!).subscribe({
      next: (data) => { this.contenuCours = data; this.contenuLoadingCours = false; this.cdr.detectChanges(); },
      error: ()     => { this.contenuLoadingCours = false; }
    });
  }

  contenuRetourCategories(): void {
    this.contenuNiveau = 0;
    this.contenuCategorieSelectee = null;
    this.contenuModuleSelectionne = null;
  }

  contenuRetourModules(): void {
    this.contenuNiveau = 1;
    this.contenuModuleSelectionne = null;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  setSection(s: string): void { this.activeSection = s; }

  getCatName(id?: number): string {
    if (!id) return '–';
    return this.categories.find(c => c.id === id)?.nom ?? '–';
  }

  getModName(id?: number): string {
    if (!id) return '–';
    return (
      this.modules.find(m => m.id === id)?.nom ??
      this.contenuModules.find(m => m.id === id)?.nom ?? '–'
    );
  }

  isMonModule(mod: ModuleDTO): boolean {
    if (this.enseignantConnecteId === null) return false;
    return mod.enseignantId === this.enseignantConnecteId;
  }

  isMonCours(c: CoursDTO): boolean {
    if (this.enseignantConnecteId === null) return false;
    return c.enseignantId === this.enseignantConnecteId;
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

  private _colors = [
    { color: 'var(--blue)',   dim: 'var(--blue-dim)',   icon: '💻' },
    { color: 'var(--brand)',  dim: 'var(--brand-dim)',  icon: '🎯' },
    { color: 'var(--green)',  dim: 'var(--green-dim)',  icon: '🔬' },
    { color: 'var(--orange)', dim: 'var(--orange-dim)', icon: '📐' },
    { color: 'var(--purple)', dim: 'var(--purple-dim)', icon: '🌐' },
  ];

  getCatStyle(i: number) { return this._colors[i % this._colors.length]; }
  getModColor(i: number) { return this._colors[i % this._colors.length]; }

  getModStatutStyle(mod: ModuleDTO): { bg: string; border: string; color: string; label: string } {
    const s = mod.statut ?? (mod.actif ? 'ACTIF' : 'BROUILLON');
    const map: Record<string, { bg: string; border: string; color: string; label: string }> = {
      ACTIF:     { bg: 'var(--green-dim)',  border: 'var(--green)',  color: 'var(--green)',  label: '✅ ACTIF'     },
      BROUILLON: { bg: 'var(--blue-dim)',   border: 'var(--blue)',   color: 'var(--blue)',   label: '📝 BROUILLON' },
      ARCHIVE:   { bg: 'var(--surface-2)', border: 'var(--border)', color: 'var(--text-3)', label: '📦 ARCHIVÉ'   },
    };
    return map[s] ?? map['BROUILLON'];
  }

  getCoursStatutStyle(statut?: string): { bg: string; border: string; color: string; label: string } {
    const map: Record<string, { bg: string; border: string; color: string; label: string }> = {
      PUBLIE:    { bg: 'var(--green-dim)',  border: 'var(--green)',  color: 'var(--green)',  label: '🟢 Publié'    },
      BROUILLON: { bg: 'var(--blue-dim)',   border: 'var(--blue)',   color: 'var(--blue)',   label: '📝 Brouillon' },
      ARCHIVE:   { bg: 'var(--surface-2)', border: 'var(--border)', color: 'var(--text-3)', label: '📦 Archivé'   },
    };
    return map[statut ?? ''] ?? map['BROUILLON'];
  }

  getNiveauStyle(n?: string): { bg: string; color: string; label: string } {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      DEBUTANT:      { bg: 'var(--green-dim)',  color: 'var(--green)',  label: '🟢 Débutant'      },
      INTERMEDIAIRE: { bg: 'var(--orange-dim)', color: 'var(--orange)', label: '🟡 Intermédiaire' },
      AVANCE:        { bg: 'var(--red-dim)',     color: 'var(--red)',    label: '🔴 Avancé'        },
    };
    return map[n ?? ''] ?? map['DEBUTANT'];
  }

  formatDureeEns(min?: number): string {
    if (!min) return '—';
    const h = Math.floor(min / 60), m = min % 60;
    return h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${min} min`;
  }

  formatDateEns(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  isPdf(filePath?: string): boolean {
    return !!filePath && filePath.toLowerCase().endsWith('.pdf');
  }

  // ── Mes Apprenants ──────────────────────────────────────────────────────────

  loadMesApprenants(): void {
    this.loadingApprenants = true;
    this.apprenantError    = '';
    this.inscriptionService.getMesApprenants().subscribe({
      next: (data) => {
        this.mesApprenants      = data;
        this.loadingApprenants  = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.apprenantError    = err.message ?? 'Impossible de charger les apprenants.';
        this.loadingApprenants = false;
        this.cdr.detectChanges();
      }
    });
  }

  chargerApprenantsDuModule(moduleId: number, moduleNom: string): void {
    this.moduleSelectionneId  = moduleId;
    this.moduleSelectionneNom = moduleNom;
    this.apprenantSearch      = '';
    this.loadingApprenants    = true;
    this.apprenantError       = '';
    this.inscriptionService.getApprenantsDuModule(moduleId).subscribe({
      next: (data) => {
        this.apprenantsDuModule = data;
        this.loadingApprenants  = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.apprenantError    = err.message ?? 'Impossible de charger les apprenants.';
        this.loadingApprenants = false;
        this.cdr.detectChanges();
      }
    });
  }

  fermerDetailApprenants(): void {
    this.moduleSelectionneId  = null;
    this.moduleSelectionneNom = '';
    this.apprenantsDuModule   = [];
    this.apprenantSearch      = '';
  }

  get apprenantsFiltres(): ApprenantInscritDTO[] {
    const liste = this.moduleSelectionneId
      ? this.apprenantsDuModule
      : this.mesApprenants;
    if (!this.apprenantSearch.trim()) return liste;
    const q = this.apprenantSearch.toLowerCase();
    return liste.filter(a =>
      String(a.apprenantId).includes(q) ||
      a.moduleNom.toLowerCase().includes(q) ||
      a.moduleCode.toLowerCase().includes(q)
    );
  }

  getNbApprenantsDuModule(moduleId: number): number {
    return this.mesApprenants.filter(a => a.moduleId === moduleId).length;
  }


}