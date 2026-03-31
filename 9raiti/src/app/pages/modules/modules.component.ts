import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { CatalogueService } from '../../core/services/catalogue.service';
import { ModuleDTO } from '../../models/module.model';

@Component({
  selector: 'app-modules',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule],
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.css']
})
export class ModulesComponent implements OnInit {

  modules: ModuleDTO[] = [];
  filteredModules: ModuleDTO[] = [];
  loading = true;
  errorMsg = '';

  // Filtre optionnel par catégorie (via queryParams, si votre API le supporte)
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
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.categorieNom = this.route.snapshot.queryParamMap.get('categorieNom') || '';

    this.catalogueService.getAllModules().subscribe({
      next: (data) => {
        this.modules = data;
        this.filteredModules = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Impossible de charger les modules. Vérifiez votre connexion.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getColor(index: number) {
    return this.colors[index % this.colors.length];
  }
}
