import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { TokenService } from '../../core/services/token.service';
import { CatalogueService } from '../../core/services/catalogue.service';
import { CategorieDTO } from '../../models/categorie.model';
import { ModuleDTO }    from '../../models/module.model';
import { CoursDTO, Niveau, StatutCours } from '../../models/cours.model';

@Component({
  selector: 'app-dashboard-enseignant',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavbarComponent, DatePipe],
  templateUrl: './dashboard-enseignant.component.html',
  styleUrls: ['./dashboard-enseignant.component.css']
})
export class DashboardEnseignantComponent implements OnInit {

  userName     = '';
  activeSection = 'accueil';

  // ── Stats (statiques pour le moment) ────────────────────────────────────────
  stats = [
    { icon: '📖', value: '0',   label: 'Cours publiés',       color: 'var(--blue)',   dim: 'var(--blue-dim)'   },
    { icon: '🏷️', value: '0',   label: 'Catégories',          color: 'var(--green)',  dim: 'var(--green-dim)'  },
    { icon: '📦', value: '0',   label: 'Modules',             color: 'var(--brand)',  dim: 'var(--brand-dim)'  },
    { icon: '👥', value: '—',   label: 'Étudiants inscrits',  color: 'var(--orange)', dim: 'var(--orange-dim)' },
  ];

  // ── Data from API ────────────────────────────────────────────────────────────
  categories: CategorieDTO[] = [];
  modules:    ModuleDTO[]    = [];
  cours:      CoursDTO[]     = [];

  loadingCategories = false;
  loadingModules    = false;
  loadingCours      = false;

  // ── Feedback ─────────────────────────────────────────────────────────────────
  successMsg = '';
  errorMsg   = '';

  // ── Delete confirm ───────────────────────────────────────────────────────────
  deleteTarget: { type: 'categorie' | 'module' | 'cours'; id: number; name: string } | null = null;

  // ══════════════════════════════════════════════════════════════════════════════
  // CATEGORIE CRUD
  // ══════════════════════════════════════════════════════════════════════════════
  showCatModal   = false;
  editingCat:    CategorieDTO | null = null;
  catForm!:      FormGroup;
  catLoading     = false;

  // ══════════════════════════════════════════════════════════════════════════════
  // MODULE CRUD
  // ══════════════════════════════════════════════════════════════════════════════
  showModModal   = false;
  editingMod:    ModuleDTO | null = null;
  modForm!:      FormGroup;
  modLoading     = false;

  // ══════════════════════════════════════════════════════════════════════════════
  // COURS CRUD
  // ══════════════════════════════════════════════════════════════════════════════
  showCoursModal   = false;
  editingCours:    CoursDTO | null = null;
  coursForm!:      FormGroup;
  coursLoading     = false;

  // Upload PDF
  selectedFile:    File | null = null;
  uploadingId:     number | null = null;
  uploadLoading    = false;

  niveaux:  Niveau[]      = ['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'];
  statuts:  StatutCours[] = ['BROUILLON', 'PUBLIE', 'ARCHIVE'];

  constructor(
    private tokenService: TokenService,
    private catalogueService: CatalogueService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userName = this.tokenService.getDisplayName();
    this.buildForms();
    this.loadAll();
  }

  // ── Build forms ──────────────────────────────────────────────────────────────
  private buildForms(): void {
    // CategoriesDTO : { nom (NotBlank), description }
    this.catForm = this.fb.group({
      nom:         ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
    });

    // ModuleDTO : { nom (NotBlank), description (NotBlank), code (NotBlank), actif, categorieId }
    this.modForm = this.fb.group({
      nom:         ['', [Validators.required, Validators.minLength(2)]],
      description: ['', Validators.required],
      code:        ['', [Validators.required, Validators.pattern(/^[A-Z0-9\-_]+$/)]],
      actif:       [true],
      categorieId: [null],
    });

    // CoursDTO : { titre (NotBlank), description (NotBlank), niveau (NotNull), moduleId (NotNull) }
    this.coursForm = this.fb.group({
      titre:        ['', [Validators.required, Validators.minLength(3)]],
      description:  ['', Validators.required],
      niveau:       ['DEBUTANT', Validators.required],
      statut:       ['BROUILLON'],
      dureeMinutes: [null, [Validators.min(1)]],
      moduleId:     [null, Validators.required],
    });
  }

  // ── Load all data ────────────────────────────────────────────────────────────
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
      error: (err) => {
        this.loadingCategories = false;
        this.showError(this.extractError(err, 'Impossible de charger les catégories.'));
      }
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
      error: (err) => {
        this.loadingModules = false;
        this.showError(this.extractError(err, 'Impossible de charger les modules.'));
      }
    });
  }

  loadCours(): void {
    this.loadingCours = true;
    this.catalogueService.getAllCours().subscribe({
      next: (data) => {
        this.cours = data;
        this.stats[0].value = String(data.filter(c => c.statut === 'PUBLIE').length);
        this.loadingCours = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingCours = false;
        this.showError(this.extractError(err, 'Impossible de charger les cours.'));
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // CATÉGORIES CRUD
  // ══════════════════════════════════════════════════════════════════════════════

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
      next: () => {
        this.catLoading   = false;
        this.showCatModal = false;
        this.loadCategories();
        this.showSuccess(this.editingCat ? 'Catégorie mise à jour.' : 'Catégorie créée.');
      },
      error: (err) => {
        this.catLoading = false;
        this.showError(this.extractError(err, 'Erreur lors de la sauvegarde.'));
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MODULES CRUD
  // ══════════════════════════════════════════════════════════════════════════════

  openCreateMod(): void {
    this.editingMod = null;
    this.modForm.reset({ nom: '', description: '', code: '', actif: true, categorieId: null });
    this.showModModal = true;
  }

  openEditMod(mod: ModuleDTO): void {
    this.editingMod = mod;
    this.modForm.patchValue({
      nom:         mod.nom,
      description: mod.description,
      code:        mod.code,
      actif:       mod.actif,
      categorieId: mod.categorieId ?? null,
    });
    this.showModModal = true;
  }

  submitMod(): void {
    if (this.modForm.invalid) { this.modForm.markAllAsTouched(); return; }
    this.modLoading = true;
    const dto: ModuleDTO = { ...this.modForm.value };

    const obs = this.editingMod?.id
      ? this.catalogueService.updateModule(this.editingMod.id, dto)
      : this.catalogueService.createModule(dto);

    obs.subscribe({
      next: () => {
        this.modLoading   = false;
        this.showModModal = false;
        this.loadModules();
        this.showSuccess(this.editingMod ? 'Module mis à jour.' : 'Module créé.');
      },
      error: (err) => {
        this.modLoading = false;
        this.showError(this.extractError(err, 'Erreur lors de la sauvegarde.'));
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // COURS CRUD
  // ══════════════════════════════════════════════════════════════════════════════

  openCreateCours(): void {
    this.editingCours = null;
    this.coursForm.reset({ titre: '', description: '', niveau: 'DEBUTANT', statut: 'BROUILLON', dureeMinutes: null, moduleId: null });
    this.selectedFile = null;
    this.showCoursModal = true;
  }

  openEditCours(c: CoursDTO): void {
    this.editingCours = c;
    this.coursForm.patchValue({
      titre:        c.titre,
      description:  c.description,
      niveau:       c.niveau,
      statut:       c.statut ?? 'BROUILLON',
      dureeMinutes: c.dureeMinutes ?? null,
      moduleId:     c.moduleId,
    });
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

        // Si un fichier PDF est sélectionné, uploader après création
        if (this.selectedFile && created.idCours) {
          this.uploadFile(created.idCours, this.selectedFile);
        }

        this.loadCours();
        this.showSuccess(this.editingCours ? 'Cours mis à jour.' : 'Cours créé avec succès.');
      },
      error: (err) => {
        this.coursLoading = false;
        this.showError(this.extractError(err, 'Erreur lors de la sauvegarde.'));
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
    } else {
      this.showError('Veuillez sélectionner un fichier PDF valide.');
      this.selectedFile = null;
    }
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
        this.showSuccess('PDF uploadé avec succès.');
      },
      error: (err) => {
        this.uploadLoading = false;
        this.uploadingId   = null;
        this.showError(this.extractError(err, 'Erreur lors de l\'upload du fichier.'));
      }
    });
  }

  openUpload(cours: CoursDTO): void {
    const input = document.createElement('input');
    input.type  = 'file';
    input.accept = 'application/pdf';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && cours.idCours) this.uploadFile(cours.idCours, file);
    };
    input.click();
  }

  getDownloadUrl(cours: CoursDTO): string {
    if (!cours.idCours) return '#';
    return this.catalogueService.getDownloadUrl(cours.idCours, 'inline');
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // SUPPRESSION (commune aux 3 entités)
  // ══════════════════════════════════════════════════════════════════════════════

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

  // ── Helpers ──────────────────────────────────────────────────────────────────
  setSection(s: string): void { this.activeSection = s; }

  getCatName(id?: number): string {
    if (!id) return '—';
    return this.categories.find(c => c.id === id)?.nom ?? '—';
  }

  getModName(id?: number): string {
    if (!id) return '—';
    return this.modules.find(m => m.id === id)?.nom ?? '—';
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
    if (s === 'PUBLIE')   return 'b-green';
    if (s === 'ARCHIVE')  return 'b-red';
    return 'b-orange';
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    this.errorMsg   = '';
    setTimeout(() => { this.successMsg = ''; this.cdr.detectChanges(); }, 4000);
  }

  private showError(msg: string): void {
    this.errorMsg   = msg;
    this.successMsg = '';
    setTimeout(() => { this.errorMsg = ''; this.cdr.detectChanges(); }, 5000);
  }

  /** Extrait le message d'erreur depuis la réponse Spring Boot */
  private extractError(err: any, fallback: string): string {
    return err?.error?.message ?? err?.error?.error ?? err?.message ?? fallback;
  }

  // Form getters
  get cf() { return this.catForm.controls;   }
  get mf() { return this.modForm.controls;   }
  get ff() { return this.coursForm.controls; }
}
