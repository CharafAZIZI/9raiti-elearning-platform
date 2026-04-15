import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { CatalogueService } from '../../core/services/catalogue.service';
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

  modules: ModuleDTO[] = [];
  filtered: ModuleDTO[] = [];
  loading = true;
  errorMsg = '';

  searchQuery = '';
  filtre: Filtre = 'tous';

  role: string = '';
  get isApprenant()  { return this.role === 'apprenant'; }
  get isEnseignant() { return this.role === 'enseignant'; }
  get isAdmin()      { return this.role === 'admin'; }

  categorieId: number | null = null;
  categorieNom = '';

  private colors = [
    { color: 'var(--blue)',   dim: 'var(--blue-dim)'   },
    { color: 'var(--brand)',  dim: 'var(--brand-dim)'  },
    { color: 'var(--green)',  dim: 'var(--green-dim)'  },
    { color: 'var(--orange)', dim: 'var(--orange-dim)' },
    { color: 'var(--purple)', dim: 'var(--purple-dim)' },
  ];

  constructor(
    private catalogueService: CatalogueService,
    private route: ActivatedRoute,
    private tokenService: TokenService
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
        if (this.isApprenant) {
          // Apprenant: uniquement les modules ACTIFS (actif === true)
          this.modules = data.filter(m => this.getStatutModule(m) === 'ACTIF');
        } else {
          // Enseignant et Admin: tous les modules, tous statuts
          this.modules = data;
        }
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Impossible de charger les modules.';
        this.loading = false;
      }
    });
  }

  /** Détermine le statut réel d'un module (priorité au champ statut, sinon actif booléen) */
  getStatutModule(m: ModuleDTO): StatutModule {
    if (m.statut) return m.statut;
    return m.actif ? 'ACTIF' : 'BROUILLON';
  }

  applyFilters(): void {
    let result = [...this.modules];
    if (!this.isApprenant) {
      if (this.filtre === 'actif')     result = result.filter(m => this.getStatutModule(m) === 'ACTIF');
      if (this.filtre === 'brouillon') result = result.filter(m => this.getStatutModule(m) === 'BROUILLON');
      if (this.filtre === 'archive')   result = result.filter(m => this.getStatutModule(m) === 'ARCHIVE');
    }
    const q = this.searchQuery.toLowerCase().trim();
    if (q) result = result.filter(m =>
      m.nom.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q));
    this.filtered = result;
  }

  setFiltre(f: Filtre): void { this.filtre = f; this.applyFilters(); }
  onSearch(): void { this.applyFilters(); }
  clearSearch(): void { this.searchQuery = ''; this.applyFilters(); }

  get actifCount()    { return this.modules.filter(m => this.getStatutModule(m) === 'ACTIF').length; }
  get brouillonCount(){ return this.modules.filter(m => this.getStatutModule(m) === 'BROUILLON').length; }
  get archiveCount()  { return this.modules.filter(m => this.getStatutModule(m) === 'ARCHIVE').length; }

  getColor(i: number) { return this.colors[i % this.colors.length]; }

  statutLabel(m: ModuleDTO): string {
    const s = this.getStatutModule(m);
    const map: Record<StatutModule, string> = { ACTIF: '✅ Actif', BROUILLON: '📝 Brouillon', ARCHIVE: '📦 Archivé' };
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
