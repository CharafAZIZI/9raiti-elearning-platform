import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { CatalogueService } from '../../core/services/catalogue.service';
import { InscriptionService } from '../../core/services/inscription.service';
import { TokenService } from '../../core/services/token.service';
import { ModuleDTO, StatutModule } from '../../models/module.model';

type Filtre = 'tous' | 'actif' | 'brouillon' | 'archive';

@Component({
  selector: 'app-modules',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule, FormsModule],
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.css']
})
export class ModulesComponent implements OnInit {

  modules:  ModuleDTO[] = [];
  filtered: ModuleDTO[] = [];
  loading  = true;
  errorMsg = '';

  searchQuery = '';
  filtre: Filtre = 'tous';

  role = '';
  get isApprenant()  { return this.role === 'apprenant'; }
  get isEnseignant() { return this.role === 'enseignant'; }
  get isAdmin()      { return this.role === 'admin'; }

  categorieId: number | null = null;
  categorieNom = '';

  // ── Inscriptions (apprenant uniquement) ────────────────────────────────
  /** Map<moduleId, estInscrit> */
  inscriptionStatus  = new Map<number, boolean>();
  /** Map<moduleId, enChargement> */
  inscriptionLoading = new Map<number, boolean>();
  toast: { type: 'success' | 'error'; text: string } | null = null;

  private colors = [
    { color: 'var(--blue)',   dim: 'var(--blue-dim)'   },
    { color: 'var(--brand)',  dim: 'var(--brand-dim)'  },
    { color: 'var(--green)',  dim: 'var(--green-dim)'  },
    { color: 'var(--orange)', dim: 'var(--orange-dim)' },
    { color: 'var(--purple)', dim: 'var(--purple-dim)' },
  ];

  constructor(
    private catalogueService:   CatalogueService,
    private inscriptionService: InscriptionService,
    private route:              ActivatedRoute,
    private tokenService:       TokenService
  ) {}

  ngOnInit(): void {
    this.role = this.tokenService.getRole()?.toLowerCase() ?? '';

    const id = this.route.snapshot.queryParamMap.get('categorieId');
    this.categorieId = id ? +id : null;
    this.categorieNom = this.route.snapshot.queryParamMap.get('categorieNom') || '';

    const obs$ = this.categorieId
      ? this.catalogueService.getModulesByCategorie(this.categorieId)
      : this.catalogueService.getAllModules();

    obs$.subscribe({
      next: (data) => {
        this.modules = this.isApprenant
          ? data.filter(m => this.getStatutModule(m) === 'ACTIF')
          : data;
        this.applyFilters();
        this.loading = false;

        // Charger les statuts d inscription pour l apprenant
        if (this.isApprenant) {
          this.loadInscriptionStatuses();
        }
      },
      error: () => {
        this.errorMsg = 'Impossible de charger les modules.';
        this.loading = false;
      }
    });
  }

  // ── Inscription helpers ───────────────────────────────────────────────

  private loadInscriptionStatuses(): void {
    this.modules.forEach(mod => {
      if (!mod.id) return;
      this.inscriptionService.estInscrit(mod.id).subscribe({
        next:  (v) => this.inscriptionStatus.set(mod.id!, v),
        error: ()  => this.inscriptionStatus.set(mod.id!, false)
      });
    });
  }

  estInscrit(moduleId: number): boolean {
    return this.inscriptionStatus.get(moduleId) ?? false;
  }

  isLoading(moduleId: number): boolean {
    return this.inscriptionLoading.get(moduleId) ?? false;
  }

  toggleInscription(mod: ModuleDTO): void {
    if (!mod.id) return;
    const id = mod.id;
    this.inscriptionLoading.set(id, true);
    this.toast = null;

    if (this.estInscrit(id)) {
      this.inscriptionService.desinscrire(id).subscribe({
        next: () => {
          this.inscriptionStatus.set(id, false);
          this.inscriptionLoading.set(id, false);
          this.showToast('success', `Vous vous etes desinsrit de "${mod.nom}".`);
        },
        error: (err) => {
          this.inscriptionLoading.set(id, false);
          this.showToast('error', err.message ?? 'Erreur lors de la desinscription.');
        }
      });
    } else {
      this.inscriptionService.inscrire(id).subscribe({
        next: () => {
          this.inscriptionStatus.set(id, true);
          this.inscriptionLoading.set(id, false);
          this.showToast('success', `Inscription au module "${mod.nom}" confirmee !`);
        },
        error: (err) => {
          this.inscriptionLoading.set(id, false);
          this.showToast('error', err.message ?? "Erreur lors de l inscription.");
        }
      });
    }
  }

  private showToast(type: 'success' | 'error', text: string): void {
    this.toast = { type, text };
    setTimeout(() => { this.toast = null; }, 4000);
  }

  // ── Filtre & Search ───────────────────────────────────────────────────

  getStatutModule(m: ModuleDTO): StatutModule {
    if (m.statut) return m.statut;
    return m.actif ? 'ACTIF' : 'BROUILLON';
  }

  applyFilters(): void {
    let r = [...this.modules];
    if (!this.isApprenant) {
      if (this.filtre === 'actif')     r = r.filter(m => this.getStatutModule(m) === 'ACTIF');
      if (this.filtre === 'brouillon') r = r.filter(m => this.getStatutModule(m) === 'BROUILLON');
      if (this.filtre === 'archive')   r = r.filter(m => this.getStatutModule(m) === 'ARCHIVE');
    }
    const q = this.searchQuery.toLowerCase().trim();
    if (q) r = r.filter(m =>
      m.nom.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q));
    this.filtered = r;
  }

  setFiltre(f: Filtre): void { this.filtre = f; this.applyFilters(); }
  onSearch(): void  { this.applyFilters(); }
  clearSearch(): void { this.searchQuery = ''; this.applyFilters(); }

  get actifCount()    { return this.modules.filter(m => this.getStatutModule(m) === 'ACTIF').length; }
  get brouillonCount(){ return this.modules.filter(m => this.getStatutModule(m) === 'BROUILLON').length; }
  get archiveCount()  { return this.modules.filter(m => this.getStatutModule(m) === 'ARCHIVE').length; }

  getColor(i: number) { return this.colors[i % this.colors.length]; }

  statutLabel(m: ModuleDTO): string {
    const s = this.getStatutModule(m);
    const map: Record<StatutModule, string> = { ACTIF: 'Actif', BROUILLON: 'Brouillon', ARCHIVE: 'Archive' };
    return map[s];
  }

  statutStyle(m: ModuleDTO): { bg: string; border: string; color: string } {
    const s = this.getStatutModule(m);
    const map: Record<StatutModule, { bg: string; border: string; color: string }> = {
      ACTIF:     { bg: 'var(--green-dim)',  border: 'var(--green)',  color: 'var(--green)'  },
      BROUILLON: { bg: 'var(--blue-dim)',   border: 'var(--blue)',   color: 'var(--blue)'   },
      ARCHIVE:   { bg: 'var(--surface-2)', border: 'var(--border)', color: 'var(--text-3)' },
    };
    return map[s];
  }
}
