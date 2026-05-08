import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { TokenService } from '../../core/services/token.service';
import { UserStateService } from '../../core/services/user-state.service';
import { CatalogueService } from '../../core/services/catalogue.service';
import { InscriptionService } from '../../core/services/inscription.service';
import { CategorieDTO } from '../../models/categorie.model';
import { ModuleDTO } from '../../models/module.model';
import { CoursDTO } from '../../models/cours.model';
import { InscriptionDTO } from '../../models/inscription.model';
import { CoursInteractionComponent } from '../../components/cours-interaction/cours-interaction.component';
import { NotificationCenterComponent } from '../../components/notification-center/notification-center.component';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-dashboard-apprenant',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule, FormsModule, CoursInteractionComponent, NotificationCenterComponent],
  templateUrl: './dashboard-apprenant.component.html',
  styleUrls: ['./dashboard-apprenant.component.css']
})
export class DashboardApprenantComponent implements OnInit, OnDestroy {

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

  // ── Mes modules inscrits ────────────────────────────────────────────────────
  mesInscriptions: InscriptionDTO[] = [];
  loadingInscriptions               = false;
  // Cours chargés par module inscrit { moduleId → CoursDTO[] }
  coursByModule: Record<number, CoursDTO[]>      = {};
  loadingCoursByModule: Record<number, boolean>  = {};
  expandedModuleId: number | null               = null;

  constructor(
    private tokenService:     TokenService,
    private userStateService: UserStateService,
    private catalogueService: CatalogueService,
    private inscriptionService: InscriptionService,
    private router:           Router,
    private notifService:     NotificationService
  ) {}

  ngOnInit(): void {
    this.notifService.connect(); // ← connexion SSE temps réel
    this.userName  = this.tokenService.getDisplayName();
    this.userEmail = this.tokenService.getUser()?.email ?? '';
    this.userStateService.user$.subscribe(() => {
      this.userName  = this.userStateService.getDisplayName();
      this.userEmail = this.tokenService.getUser()?.email ?? '';
    });
    this.loadCatalogue();
    this.loadMesInscriptions();
  }

  ngOnDestroy(): void { this.notifService.disconnect(); }

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

  // ── Mes modules inscrits ─────────────────────────────────────────────────────

  loadMesInscriptions(): void {
    this.loadingInscriptions = true;
    this.inscriptionService.getMesInscriptions().subscribe({
      next: (ins) => {
        this.mesInscriptions     = ins;
        this.loadingInscriptions = false;
      },
      error: () => { this.loadingInscriptions = false; }
    });
  }

  toggleModule(moduleId: number): void {
    if (this.expandedModuleId === moduleId) {
      this.expandedModuleId = null;
      return;
    }
    this.expandedModuleId = moduleId;
    if (!this.coursByModule[moduleId]) {
      this.loadingCoursByModule[moduleId] = true;
      this.catalogueService.getCoursByModule(moduleId).subscribe({
        next: (c) => {
          this.coursByModule[moduleId]        = c.filter(x => x.statut === 'PUBLIE');
          this.loadingCoursByModule[moduleId] = false;
        },
        error: () => { this.loadingCoursByModule[moduleId] = false; }
      });
    }
  }

  getCoursForModule(moduleId: number): CoursDTO[] {
    return this.coursByModule[moduleId] ?? [];
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