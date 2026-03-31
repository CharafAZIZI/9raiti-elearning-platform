import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { CatalogueService } from '../../core/services/catalogue.service';
import { CategorieDTO } from '../../models/categorie.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  categories: CategorieDTO[] = [];
  loading = true;
  errorMsg = '';

  // Palette de couleurs pour les cartes
  private colors = [
    { color: 'var(--blue)',   dim: 'var(--blue-dim)'   },
    { color: 'var(--brand)',  dim: 'var(--brand-dim)'  },
    { color: 'var(--green)',  dim: 'var(--green-dim)'  },
    { color: 'var(--orange)', dim: 'var(--orange-dim)' },
    { color: 'var(--purple)', dim: 'var(--purple-dim)' },
  ];

  private icons = ['📂', '🗂️', '📁', '📚', '🎯', '🔬', '💡', '🌐'];

  constructor(private catalogueService: CatalogueService) {}

  ngOnInit(): void {
    this.catalogueService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Impossible de charger les catégories. Vérifiez votre connexion.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getColor(index: number) {
    return this.colors[index % this.colors.length];
  }

  getIcon(index: number): string {
    return this.icons[index % this.icons.length];
  }
}
