import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { CatalogueService } from '../../core/services/catalogue.service';
import { TokenService } from '../../core/services/token.service';
import { CoursDTO, Niveau } from '../../models/cours.model';
import { ModuleDTO } from '../../models/module.model';
import { forkJoin } from 'rxjs';

type Vue = 'grille' | 'liste';

import { CoursInteractionComponent } from '../../components/cours-interaction/cours-interaction.component';

@Component({
  selector: 'app-cours',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule, FormsModule, CoursInteractionComponent],
  templateUrl: './cours.component.html',
  styleUrls: ['./cours.component.css']
})
export class CoursComponent implements OnInit {

  cours: CoursDTO[] = [];
  filtered: CoursDTO[] = [];
  loading = true;
  errorMsg = '';

  searchQuery = '';
  niveauFiltre: Niveau | 'tous' = 'tous';
  vue: Vue = 'grille';

  categorieId: number | null = null;
  categorieNom = '';

  role: string = '';
  get isApprenant()  { return this.role === 'apprenant'; }
  get isEnseignant() { return this.role === 'enseignant'; }
  get isAdmin()      { return this.role === 'admin'; }

  moduleId: number | null = null;
  moduleNom = '';

  niveaux: { value: Niveau | 'tous'; label: string; icon: string }[] = [
    { value: 'tous',          label: 'Tous',          icon: '📚' },
    { value: 'DEBUTANT',      label: 'Débutant',      icon: '🟢' },
    { value: 'INTERMEDIAIRE', label: 'Intermédiaire', icon: '🟡' },
    { value: 'AVANCE',        label: 'Avancé',        icon: '🔴' },
  ];

  niveauColors: Record<string, string> = {
    DEBUTANT: 'var(--green)', INTERMEDIAIRE: 'var(--orange)', AVANCE: 'var(--red)'
  };

  statutStyle: Record<string, { bg: string; border: string; color: string; label: string }> = {
    PUBLIE:    { bg: 'var(--green-dim)',  border: 'var(--green)',  color: 'var(--green)',  label: '🟢 Publié'    },
    BROUILLON: { bg: 'var(--blue-dim)',   border: 'var(--blue)',   color: 'var(--blue)',   label: '📝 Brouillon' },
    ARCHIVE:   { bg: 'var(--surface-2)', border: 'var(--border)', color: 'var(--text-3)', label: '📦 Archivé'   },
  };

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

    const id = this.route.snapshot.queryParamMap.get('moduleId');
    this.moduleId = id ? +id : null;
    this.moduleNom = this.route.snapshot.queryParamMap.get('moduleNom') || '';
    const cid = this.route.snapshot.queryParamMap.get('categorieId');
    this.categorieId  = cid ? +cid : null;
    this.categorieNom = this.route.snapshot.queryParamMap.get('categorieNom') || '';

    if (this.isApprenant) {
      this.loadForApprenant();
    } else {
      // Enseignant et Admin : accès complet à tous les cours
      const obs$ = this.moduleId
        ? this.catalogueService.getCoursByModule(this.moduleId)
        : this.catalogueService.getAllCours();
      obs$.subscribe({
        next: (data) => { this.cours = data; this.applyFilters(); this.loading = false; },
        error: () => { this.errorMsg = 'Impossible de charger les cours.'; this.loading = false; }
      });
    }
  }

  /**
   * Règle Apprenant :
   *  - Le module parent doit être ACTIF (actif === true)
   *  - Le cours doit être PUBLIE
   *  - Si le module est BROUILLON ou ARCHIVE → tous ses cours sont masqués
   */
  private loadForApprenant(): void {
    forkJoin({
      allCours: this.moduleId
        ? this.catalogueService.getCoursByModule(this.moduleId)
        : this.catalogueService.getAllCours(),
      allModules: this.catalogueService.getAllModules()
    }).subscribe({
      next: ({ allCours, allModules }) => {
        const activeModuleIds = new Set(
          allModules
            .filter(m => m.actif && (!m.statut || m.statut === 'ACTIF'))
            .map(m => m.id!)
        );
        // Cours visible : PUBLIE ET module parent ACTIF
        this.cours = allCours.filter(c =>
          c.statut === 'PUBLIE' &&
          c.moduleId != null &&
          activeModuleIds.has(c.moduleId)
        );
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.errorMsg = 'Impossible de charger les cours.'; this.loading = false; }
    });
  }

  applyFilters(): void {
    let result = [...this.cours];
    if (this.niveauFiltre !== 'tous')
      result = result.filter(c => c.niveau === this.niveauFiltre);
    const q = this.searchQuery.toLowerCase().trim();
    if (q) result = result.filter(c =>
      c.titre.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q));
    this.filtered = result;
  }

  setNiveau(n: Niveau | 'tous'): void { this.niveauFiltre = n; this.applyFilters(); }
  onSearch(): void { this.applyFilters(); }
  clearSearch(): void { this.searchQuery = ''; this.applyFilters(); }
  setVue(v: Vue): void { this.vue = v; }

  countByNiveau(n: Niveau): number { return this.cours.filter(c => c.niveau === n).length; }

  getColor(i: number) { return this.colors[i % this.colors.length]; }

  getStatut(statut?: string) {
    return this.statutStyle[statut ?? ''] ?? this.statutStyle['ARCHIVE'];
  }

  formatDuree(min?: number): string {
    if (!min) return '—';
    const h = Math.floor(min / 60), m = min % 60;
    return h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${min} min`;
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  isPdf(filePath?: string): boolean {
    if (!filePath) return false;
    return filePath.toLowerCase().endsWith('.pdf');
  }
}