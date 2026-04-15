import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { CatalogueService } from '../../core/services/catalogue.service';
import { CoursDTO } from '../../models/cours.model';

type FileType = 'pdf' | 'video' | 'unknown' | null;

@Component({
  selector: 'app-cours-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './cours-detail.component.html',
  styleUrls: ['./cours-detail.component.css']
})
export class CoursDetailComponent implements OnInit {

  cours: CoursDTO | null = null;
  loading = true;
  errorMsg = '';

  // Fichier
  fileLoading = false;
  fileError   = '';
  fileType: FileType = null;
  presignedUrl: SafeResourceUrl | null = null;
  rawUrl = '';   // URL brute pour <video src>

  constructor(
    private route: ActivatedRoute,
    private catalogueService: CatalogueService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.errorMsg = 'ID de cours invalide.'; this.loading = false; return; }

    this.catalogueService.getCoursById(id).subscribe({
      next: (c) => { this.cours = c; this.loading = false; },
      error: () => { this.errorMsg = 'Impossible de charger ce cours.'; this.loading = false; }
    });
  }

  /** Appelé quand l'apprenant clique "Accéder au contenu" */
  loadFile(): void {
    if (!this.cours?.idCours || !this.cours.filePath) return;

    this.fileLoading = true;
    this.fileError   = '';
    this.presignedUrl = null;
    this.rawUrl = '';
    this.fileType = null;

    this.catalogueService.getPresignedUrl(this.cours.idCours).subscribe({
      next: (res) => {
        this.fileLoading = false;
        this.rawUrl = res.url;

        if (res.type === 'pdf') {
          this.fileType = 'pdf';
          // Bypass de la sécurité Angular pour les URLs de ressources
          this.presignedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(res.url);
        } else if (res.type.startsWith('video/')) {
          this.fileType = 'video';
          this.presignedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(res.url);
        } else {
          this.fileType = 'unknown';
        }
      },
      error: () => {
        this.fileLoading = false;
        this.fileError   = 'Impossible de charger le fichier. Réessayez.';
      }
    });
  }

  get isPdf()   { return this.fileType === 'pdf'; }
  get isVideo() { return this.fileType === 'video'; }
  get hasFile() { return !!this.cours?.filePath; }

  formatDuree(min?: number): string {
    if (!min) return '–';
    const h = Math.floor(min / 60), m = min % 60;
    return h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${min} min`;
  }

  formatDate(d?: string): string {
    if (!d) return '–';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}
