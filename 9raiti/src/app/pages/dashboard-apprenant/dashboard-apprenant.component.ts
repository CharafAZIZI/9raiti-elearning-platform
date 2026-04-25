import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { TokenService } from '../../core/services/token.service';
import { UserStateService } from '../../core/services/user-state.service';
import { CatalogueService } from '../../core/services/catalogue.service';
import { CategorieDTO } from '../../models/categorie.model';
import { ModuleDTO } from '../../models/module.model';
import { CoursDTO } from '../../models/cours.model';

@Component({
  selector: 'app-dashboard-apprenant',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule, FormsModule],
  templateUrl: './dashboard-apprenant.component.html',
  styleUrls: ['./dashboard-apprenant.component.css']
})
export class DashboardApprenantComponent implements OnInit {

  userName      = '';
  activeSection = 'accueil';
  userEmail     = '';

  // ── Stats ───────────────────────────────────────────────────────────────────
  stats = [
    { icon: '📂', value: '–', label: 'Catégories',    color: 'var(--green)',  dim: 'var(--green-dim)'  },
    { icon: '📦', value: '–', label: 'Modules',       color: 'var(--brand)',  dim: 'var(--brand-dim)'  },
    { icon: '📘', value: '–', label: 'Cours publiés', color: 'var(--blue)',   dim: 'var(--blue-dim)'   },
  ];

  // ── Catalogue hiérarchique ──────────────────────────────────────────────────
  categories: CategorieDTO[]        = [];
  modules:    ModuleDTO[]           = [];
  cours:      CoursDTO[]            = [];
  loadingCatalogue                  = false;

  catalogNiveau: 0 | 1 | 2         = 0;
  selectedCat: CategorieDTO | null  = null;
  selectedMod: ModuleDTO | null     = null;
  catModules:  ModuleDTO[]          = [];
  modCours:    CoursDTO[]           = [];
  loadingModules                    = false;
  loadingCours                      = false;

  constructor(
    private tokenService:     TokenService,
    private userStateService: UserStateService,
    private catalogueService: CatalogueService,
    private router:           Router
  ) {}

  ngOnInit(): void {
    this.userName  = this.tokenService.getDisplayName();
    this.userEmail = this.tokenService.getUser()?.email ?? '';
    this.userStateService.user$.subscribe(() => {
      this.userName  = this.userStateService.getDisplayName();
      this.userEmail = this.tokenService.getUser()?.email ?? '';
    });
    this.loadCatalogue();
  }

  // ── Catalogue ────────────────────────────────────────────────────────────────

  loadCatalogue(): void {
    this.loadingCatalogue = true;
    this.catalogueService.getAllCategories().subscribe({
      next: (cats) => {
        this.categories       = cats;
        this.stats[0].value   = String(cats.length);
        this.loadingCatalogue = false;
      },
      error: () => { this.loadingCatalogue = false; }
    });
    this.catalogueService.getAllModules().subscribe({
      next: (mods) => {
        this.modules = mods;
        const actifs = mods.filter(m => m.actif && (!m.statut || m.statut === 'ACTIF'));
        this.stats[1].value = String(actifs.length);
      }
    });
    this.catalogueService.getAllCours().subscribe({
      next: (c) => {
        this.cours          = c;
        this.stats[2].value = String(c.filter(x => x.statut === 'PUBLIE').length);
      }
    });
  }

  selectionnerCategorie(cat: CategorieDTO): void {
    this.selectedCat    = cat;
    this.selectedMod    = null;
    this.catalogNiveau  = 1;
    this.loadingModules = true;
    this.catModules     = [];
    this.catalogueService.getModulesByCategorie(cat.id!).subscribe({
      next: (m) => {
        this.catModules     = m.filter(x => x.actif && (!x.statut || x.statut === 'ACTIF'));
        this.loadingModules = false;
      },
      error: () => { this.loadingModules = false; }
    });
  }

  selectionnerModule(mod: ModuleDTO): void {
    this.selectedMod   = mod;
    this.catalogNiveau = 2;
    this.loadingCours  = true;
    this.modCours      = [];
    this.catalogueService.getCoursByModule(mod.id!).subscribe({
      next: (c) => { this.modCours = c.filter(x => x.statut === 'PUBLIE'); this.loadingCours = false; },
      error: ()  => { this.loadingCours = false; }
    });
  }

  retourCategories(): void {
    this.catalogNiveau = 0;
    this.selectedCat   = null;
    this.selectedMod   = null;
  }

  retourModules(): void {
    this.catalogNiveau = 1;
    this.selectedMod   = null;
  }

  getModulesCount(catId: number): number {
    return this.modules.filter(m => m.categorieId === catId && m.actif && (!m.statut || m.statut === 'ACTIF')).length;
  }

  getCoursCount(modId: number): number {
    return this.cours.filter(c => c.moduleId === modId && c.statut === 'PUBLIE').length;
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  setSection(s: string): void  { this.activeSection = s; }
  navigateToProfil(): void     { this.router.navigate(['/profil']); }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  getNiveauCls(n: string | undefined): string {
    if (n === 'DEBUTANT')      return 'b-green';
    if (n === 'INTERMEDIAIRE') return 'b-blue';
    return 'b-red';
  }

  getStatutCoursCls(s: string | undefined): string {
    if (s === 'PUBLIE')  return 'b-green';
    if (s === 'ARCHIVE') return 'b-red';
    return 'b-orange';
  }
}
