import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { CatalogueService } from '../../core/services/catalogue.service';
import { CoursDTO } from '../../models/cours.model';

@Component({
  selector: 'app-cours',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule],
  templateUrl: './cours.component.html',
  styleUrls: ['./cours.component.css']
})
export class CoursComponent implements OnInit {

  cours: CoursDTO[] = [];
  loading = true;
  errorMsg = '';
  moduleNom = '';

  private colors = [
    { color: 'var(--blue)',   dim: 'var(--blue-dim)'   },
    { color: 'var(--brand)',  dim: 'var(--brand-dim)'  },
    { color: 'var(--green)',  dim: 'var(--green-dim)'  },
    { color: 'var(--orange)', dim: 'var(--orange-dim)' },
    { color: 'var(--purple)', dim: 'var(--purple-dim)' },
  ];

  niveauLabels: Record<string, string> = {
    DEBUTANT: '🟢 Débutant',
    INTERMEDIAIRE: '🟡 Intermédiaire',
    AVANCE: '🔴 Avancé'
  };

  niveauColors: Record<string, string> = {
    DEBUTANT: 'var(--green)',
    INTERMEDIAIRE: 'var(--orange)',
    AVANCE: 'var(--red,#ef4444)'
  };

  statutColors: Record<string, {bg: string; border: string; color: string}> = {
    PUBLIE:    { bg: 'var(--green-dim)',  border: 'var(--green)',        color: 'var(--green)'        },
    BROUILLON: { bg: 'var(--blue-dim)',   border: 'var(--blue)',         color: 'var(--blue)'         },
    ARCHIVE:   { bg: 'var(--surface-2)', border: 'var(--border)',        color: 'var(--text-3)'       },
  };

  constructor(
    private catalogueService: CatalogueService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.moduleNom = this.route.snapshot.queryParamMap.get('moduleNom') || '';

    this.catalogueService.getAllCours().subscribe({
      next: (data) => {
        this.cours = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Impossible de charger les cours. Vérifiez votre connexion.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getColor(index: number) {
    return this.colors[index % this.colors.length];
  }

  formatDuree(minutes?: number): string {
    if (!minutes) return '—';
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }

  formatDate(date?: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  getStatut(statut?: string): {bg: string; border: string; color: string; label: string} {
    const map: Record<string, string> = {
      PUBLIE: 'Publié', BROUILLON: 'Brouillon', ARCHIVE: 'Archivé'
    };
    const style = this.statutColors[statut ?? ''] ?? this.statutColors['ARCHIVE'];
    return { ...style, label: map[statut ?? ''] ?? statut ?? '—' };
  }
}
