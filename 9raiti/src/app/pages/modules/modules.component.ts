import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { CatalogueService } from '../../core/services/catalogue.service';
import { ModuleDTO } from '../../models/module.model';

type Filtre = 'tous' | 'actif' | 'inactif';

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

  categorieId: number | null = null;
  categorieNom = '';

  private colors = [
    { color: 'var(--blue)',   dim: 'var(--blue-dim)'   },
    { color: 'var(--brand)',  dim: 'var(--brand-dim)'  },
    { color: 'var(--green)',  dim: 'var(--green-dim)'  },
    { color: 'var(--orange)', dim: 'var(--orange-dim)' },
    { color: 'var(--purple)', dim: 'var(--purple-dim)' },
  ];

  constructor(private catalogueService: CatalogueService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('categorieId');
    this.categorieId = id ? +id : null;
    this.categorieNom = this.route.snapshot.queryParamMap.get('categorieNom') || '';

    const obs$ = this.categorieId
      ? this.catalogueService.getModulesByCategorie(this.categorieId)
      : this.catalogueService.getAllModules();

    obs$.subscribe({
      next: (data) => {
        this.modules = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Impossible de charger les modules.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let result = [...this.modules];
    if (this.filtre === 'actif')   result = result.filter(m => m.actif);
    if (this.filtre === 'inactif') result = result.filter(m => !m.actif);
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

  get actifCount()   { return this.modules.filter(m => m.actif).length; }
  get inactifCount() { return this.modules.filter(m => !m.actif).length; }

  getColor(i: number) { return this.colors[i % this.colors.length]; }
}
