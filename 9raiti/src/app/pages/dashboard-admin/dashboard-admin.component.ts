import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TokenService } from '../../core/services/token.service';
import { AdminUserService, User } from '../../core/services/admin-user.service';
import { CatalogueService } from '../../core/services/catalogue.service';
import { CategorieDTO } from '../../models/categorie.model';
import { ModuleDTO, StatutModule } from '../../models/module.model';
import { CoursDTO, Niveau, StatutCours } from '../../models/cours.model';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class DashboardAdminComponent implements OnInit {

  // ── Utilisateurs ─────────────────────────────────────────────────────────────
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;
  actionLoading: { [key: number]: string } = {};
  searchQuery = '';
  roleFilter = 'all';
  statusFilter = 'all';
  deleteConfirmId: number | null = null;

  // ── UI ────────────────────────────────────────────────────────────────────────
  activeTab = 'users';
  logoutLoading = false;
  errorMessage = '';
  successMessage = '';

  // ── Profil ────────────────────────────────────────────────────────────────────
  displayName = '';
  email = '';
  initials = '?';

  // ══════════════════════════════════════════════════════════════════════════════
  // GESTION DU CONTENU
  // ══════════════════════════════════════════════════════════════════════════════
  categories:  CategorieDTO[] = [];
  modules:     ModuleDTO[]    = [];
  cours:       CoursDTO[]     = [];

  loadingCategories = false;
  loadingModules    = false;
  loadingCours      = false;

  contentTab: 'categories' | 'modules' | 'cours' = 'categories';

  // Suppression contenu
  deleteTarget: { type: 'categorie' | 'module' | 'cours'; id: number; name: string } | null = null;

  // Formulaire Catégorie
  showCatModal = false;
  editingCat:  CategorieDTO | null = null;
  catForm!:    FormGroup;
  catLoading   = false;

  // Formulaire Module
  showModModal = false;
  editingMod:  ModuleDTO | null = null;
  modForm!:    FormGroup;
  modLoading   = false;

  // Formulaire Cours
  showCoursModal = false;
  editingCours:  CoursDTO | null = null;
  coursForm!:    FormGroup;
  coursLoading   = false;

  niveaux:  Niveau[]      = ['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'];
  statuts:  StatutCours[] = ['BROUILLON', 'PUBLIE', 'ARCHIVE'];

  constructor(
    private adminService: AdminUserService,
    private tokenService: TokenService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private catalogueService: CatalogueService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const user = this.tokenService.getUser();
    if (user) {
      this.email = user.email ?? '';
      this.displayName = this.tokenService.getDisplayName();
      this.initials = user.prenom && user.nom
        ? (user.prenom[0] + user.nom[0]).toUpperCase()
        : (user.email?.substring(0, 2).toUpperCase() ?? '?');
    }
    this.buildForms();
    this.loadUsers();
    this.loadContentData();
  }

  private buildForms(): void {
    this.catForm = this.fb.group({
      nom:         ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
    });
    this.modForm = this.fb.group({
      nom:         ['', [Validators.required, Validators.minLength(2)]],
      description: ['', Validators.required],
      code:        ['', [Validators.required, Validators.pattern(/^[A-Z0-9\-_]+$/)]],
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

  // ── Chargement contenu ────────────────────────────────────────────────────────
  loadContentData(): void { this.loadCategories(); this.loadModules(); this.loadCours(); }

  loadCategories(): void {
    this.loadingCategories = true;
    this.catalogueService.clearCache();
    this.catalogueService.getAllCategories().subscribe({
      next: (d) => { this.categories = d; this.loadingCategories = false; this.cdr.detectChanges(); },
      error: (e) => { this.loadingCategories = false; this.showError(this.extractError(e, 'Erreur catégories.')); }
    });
  }

  loadModules(): void {
    this.loadingModules = true;
    this.catalogueService.clearCache();
    this.catalogueService.getAllModules().subscribe({
      next: (d) => { this.modules = d; this.loadingModules = false; this.cdr.detectChanges(); },
      error: (e) => { this.loadingModules = false; this.showError(this.extractError(e, 'Erreur modules.')); }
    });
  }

  loadCours(): void {
    this.loadingCours = true;
    this.catalogueService.clearCache();
    this.catalogueService.getAllCours().subscribe({
      next: (d) => { this.cours = d; this.loadingCours = false; this.cdr.detectChanges(); },
      error: (e) => { this.loadingCours = false; this.showError(this.extractError(e, 'Erreur cours.')); }
    });
  }

  // ── Stats contenu ─────────────────────────────────────────────────────────────
  get contentStats() {
    return {
      totalCategories: this.categories.length,
      totalModules:    this.modules.length,
      modulesActifs:   this.modules.filter(m => m.actif).length,
      totalCours:      this.cours.length,
      coursPublies:    this.cours.filter(c => c.statut === 'PUBLIE').length,
      coursBrouillons: this.cours.filter(c => c.statut === 'BROUILLON').length,
    };
  }

  // ── CRUD Catégories ───────────────────────────────────────────────────────────
  openCreateCat(): void { this.editingCat = null; this.catForm.reset({ nom: '', description: '' }); this.showCatModal = true; }
  openEditCat(cat: CategorieDTO): void { this.editingCat = cat; this.catForm.patchValue({ nom: cat.nom, description: cat.description ?? '' }); this.showCatModal = true; }

  submitCat(): void {
    if (this.catForm.invalid) { this.catForm.markAllAsTouched(); return; }
    this.catLoading = true;
    const obs = this.editingCat?.id
      ? this.catalogueService.updateCategorie(this.editingCat.id, this.catForm.value)
      : this.catalogueService.createCategorie(this.catForm.value);
    obs.subscribe({
      next: () => { this.catLoading = false; this.showCatModal = false; this.loadCategories(); this.showSuccess(this.editingCat ? 'Catégorie mise à jour.' : 'Catégorie créée.'); },
      error: (e) => { this.catLoading = false; this.showError(this.extractError(e, 'Erreur sauvegarde.')); }
    });
  }

  // ── CRUD Modules ──────────────────────────────────────────────────────────────
  openCreateMod(): void { this.editingMod = null; this.modForm.reset({ nom: '', description: '', code: '', actif: true, statut: 'ACTIF', categorieId: null }); this.showModModal = true; }
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
    // Synchronise actif booléen avec le statut
    const actif = val.statut === 'ACTIF';
    const dto: ModuleDTO = { ...val, actif };
    const obs = this.editingMod?.id
      ? this.catalogueService.updateModule(this.editingMod.id, dto)
      : this.catalogueService.createModule(dto);
    obs.subscribe({
      next: () => { this.modLoading = false; this.showModModal = false; this.loadModules(); this.showSuccess(this.editingMod ? 'Module mis à jour.' : 'Module créé.'); },
      error: (e) => { this.modLoading = false; this.showError(this.extractError(e, 'Erreur sauvegarde.')); }
    });
  }

  // ── CRUD Cours ────────────────────────────────────────────────────────────────
  openCreateCours(): void {
    this.editingCours = null;
    this.coursForm.reset({ titre: '', description: '', niveau: 'DEBUTANT', statut: 'BROUILLON', dureeMinutes: null, moduleId: null });
    this.showCoursModal = true;
  }
  openEditCours(c: CoursDTO): void {
    this.editingCours = c;
    this.coursForm.patchValue({ titre: c.titre, description: c.description, niveau: c.niveau, statut: c.statut ?? 'BROUILLON', dureeMinutes: c.dureeMinutes ?? null, moduleId: c.moduleId });
    this.showCoursModal = true;
  }

  submitCours(): void {
    if (this.coursForm.invalid) { this.coursForm.markAllAsTouched(); return; }
    this.coursLoading = true;
    const dto: CoursDTO = {
      titre: this.coursForm.value.titre, description: this.coursForm.value.description,
      niveau: this.coursForm.value.niveau, statut: this.coursForm.value.statut,
      dureeMinutes: this.coursForm.value.dureeMinutes || undefined,
      moduleId: Number(this.coursForm.value.moduleId),
    };
    const obs = this.editingCours?.idCours
      ? this.catalogueService.updateCours(this.editingCours.idCours, dto)
      : this.catalogueService.createCours(dto);
    obs.subscribe({
      next: () => { this.coursLoading = false; this.showCoursModal = false; this.loadCours(); this.showSuccess(this.editingCours ? 'Cours mis à jour.' : 'Cours créé.'); },
      error: (e) => { this.coursLoading = false; this.showError(this.extractError(e, 'Erreur sauvegarde.')); }
    });
  }

  // ── Suppression contenu ───────────────────────────────────────────────────────
  confirmDeleteContent(type: 'categorie' | 'module' | 'cours', id: number, name: string): void { this.deleteTarget = { type, id, name }; }
  cancelDeleteContent(): void { this.deleteTarget = null; }
  executeDeleteContent(): void {
    if (!this.deleteTarget) return;
    const { type, id } = this.deleteTarget;
    this.deleteTarget = null;
    const obs = type === 'categorie' ? this.catalogueService.deleteCategorie(id)
              : type === 'module'    ? this.catalogueService.deleteModule(id)
              :                        this.catalogueService.deleteCours(id);
    obs.subscribe({
      next: () => {
        const label = type === 'categorie' ? 'Catégorie' : type === 'module' ? 'Module' : 'Cours';
        this.showSuccess(`${label} supprimé(e).`);
        if (type === 'categorie') this.loadCategories();
        else if (type === 'module') this.loadModules();
        else this.loadCours();
      },
      error: (e) => this.showError(this.extractError(e, 'Erreur suppression.'))
    });
  }

  // ── Helpers affichage ─────────────────────────────────────────────────────────
  getCatName(id?: number): string { return id ? (this.categories.find(c => c.id === id)?.nom ?? '—') : '—'; }
  getModName(id?: number): string { return id ? (this.modules.find(m => m.id === id)?.nom ?? '—') : '—'; }
  getNiveauLabel(n?: Niveau): string {
    return n === 'DEBUTANT' ? '🟢 Débutant' : n === 'INTERMEDIAIRE' ? '🟡 Intermédiaire' : n === 'AVANCE' ? '🔴 Avancé' : '—';
  }
  getStatutCls(s?: StatutCours): string { return s === 'PUBLIE' ? 'b-green' : s === 'ARCHIVE' ? 'b-red' : 'b-orange'; }
  getStatutLabel(s?: StatutCours): string { return s === 'PUBLIE' ? '🟢 Publié' : s === 'ARCHIVE' ? '📦 Archivé' : '📝 Brouillon'; }
  formatDuree(min?: number): string {
    if (!min) return '—';
    const h = Math.floor(min / 60), m = min % 60;
    return h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${min} min`;
  }

  get cf() { return this.catForm.controls; }
  get mf() { return this.modForm.controls; }
  get ff() { return this.coursForm.controls; }

  // ══════════════════════════════════════════════════════════════════════════════
  // GESTION UTILISATEURS
  // ══════════════════════════════════════════════════════════════════════════════
  loadUsers(): void {
    this.loading = true;
    this.adminService.getAll().subscribe({
      next: (users) => { this.users = users; this.applyFilters(); this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.errorMessage = 'Impossible de charger les utilisateurs.'; this.loading = false; }
    });
  }

  applyFilters(): void {
    let result = [...this.users];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(u => u.nom?.toLowerCase().includes(q) || u.prenom?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }
    if (this.roleFilter !== 'all')         result = result.filter(u => u.role?.toLowerCase() === this.roleFilter);
    if (this.statusFilter === 'active')    result = result.filter(u => u.est_actif);
    else if (this.statusFilter === 'inactive') result = result.filter(u => !u.est_actif);
    else if (this.statusFilter === 'pending')  result = result.filter(u => u.role?.toLowerCase() === 'enseignant' && !u.est_valide);
    this.filteredUsers = result;
  }

  get stats() {
    return {
      total:       this.users.length,
      apprenants:  this.users.filter(u => u.role?.toLowerCase() === 'apprenant').length,
      enseignants: this.users.filter(u => u.role?.toLowerCase() === 'enseignant').length,
      pending:     this.users.filter(u => u.role?.toLowerCase() === 'enseignant' && !u.est_valide).length,
      suspended:   this.users.filter(u => !u.est_actif).length
    };
  }

  valider(user: User): void {
    this.actionLoading[user.id] = 'valider';
    this.adminService.validerEnseignant(user.id).subscribe({
      next: (updated) => { this.updateUser(updated); this.showSuccess(`${user.prenom} ${user.nom} validé(e).`); delete this.actionLoading[user.id]; },
      error: () => { this.showError('Erreur validation.'); delete this.actionLoading[user.id]; }
    });
  }

  toggleStatus(user: User): void {
    this.actionLoading[user.id] = 'status';
    const obs = user.est_actif ? this.adminService.suspendre(user.id) : this.adminService.activer(user.id);
    obs.subscribe({
      next: (updated) => { this.updateUser(updated); this.showSuccess(`${user.prenom} ${user.nom} ${updated.est_actif ? 'activé(e)' : 'suspendu(e)'}.`); delete this.actionLoading[user.id]; },
      error: () => { this.showError('Erreur statut.'); delete this.actionLoading[user.id]; }
    });
  }

  confirmDelete(id: number): void { this.deleteConfirmId = id; }
  cancelDelete(): void { this.deleteConfirmId = null; }
  deleteConfirmed(): void { const user = this.users.find(u => u.id === this.deleteConfirmId); if (user) this.deleteUser(user); }

  deleteUser(user: User): void {
    this.actionLoading[user.id] = 'delete';
    this.deleteConfirmId = null;
    this.adminService.delete(user.id).subscribe({
      next: () => { this.users = this.users.filter(u => u.id !== user.id); this.applyFilters(); this.showSuccess(`${user.prenom} ${user.nom} supprimé(e).`); delete this.actionLoading[user.id]; },
      error: () => { this.showError('Erreur suppression.'); delete this.actionLoading[user.id]; }
    });
  }

  private updateUser(updated: User): void {
    const idx = this.users.findIndex(u => u.id === updated.id);
    if (idx !== -1) { this.users[idx] = { ...this.users[idx], ...updated }; this.applyFilters(); this.cdr.detectChanges(); }
  }

  getInitials(user: User): string {
    if (user.prenom && user.nom) return (user.prenom[0] + user.nom[0]).toUpperCase();
    return user.email?.substring(0, 2).toUpperCase() ?? '??';
  }

  getRoleClass(role: string): string {
    switch (role?.toLowerCase()) {
      case 'apprenant':  return 'badge-apprenant';
      case 'enseignant': return 'badge-enseignant';
      case 'admin':      return 'badge-admin';
      default:           return 'badge-default';
    }
  }

  logout(): void {
    this.logoutLoading = true;
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.post(`/api/auth/logout`, {}, { headers, responseType: 'text' as const }).subscribe({
      next: () => { this.tokenService.removeToken(); this.router.navigate(['/login']); },
      error: () => { this.tokenService.removeToken(); this.router.navigate(['/login']); }
    });
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg; this.errorMessage = '';
    setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 4000);
  }

  private showError(msg: string): void {
    this.errorMessage = msg; this.successMessage = '';
    setTimeout(() => { this.errorMessage = ''; this.cdr.detectChanges(); }, 5000);
  }

  private extractError(err: any, fallback: string): string {
    return err?.error?.message ?? err?.error?.error ?? err?.message ?? fallback;
  }
}
