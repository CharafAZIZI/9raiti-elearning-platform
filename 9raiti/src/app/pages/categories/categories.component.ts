import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { CatalogueService } from '../../core/services/catalogue.service';
import { CategorieDTO } from '../../models/categorie.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  categories: CategorieDTO[] = [];
  filtered: CategorieDTO[] = [];
  loading = true;
  errorMsg = '';
  searchQuery = '';

  private colors = [
    { color: 'var(--blue)',   dim: 'var(--blue-dim)',   icon: '💻' },
    { color: 'var(--brand)',  dim: 'var(--brand-dim)',  icon: '🎯' },
    { color: 'var(--green)',  dim: 'var(--green-dim)',  icon: '🔬' },
    { color: 'var(--orange)', dim: 'var(--orange-dim)', icon: '📐' },
    { color: 'var(--purple)', dim: 'var(--purple-dim)', icon: '🌐' },
  ];

  constructor(private catalogueService: CatalogueService) {}

  ngOnInit(): void {
    this.catalogueService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.filtered = data;
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Impossible de charger les catégories.';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filtered = q
      ? this.categories.filter(c =>
          c.nom.toLowerCase().includes(q) ||
          (c.description ?? '').toLowerCase().includes(q))
      : [...this.categories];
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filtered = [...this.categories];
  }

  getStyle(i: number) { return this.colors[i % this.colors.length]; }
}
