// ──────────────────────────────────────────────────────────────
// ai-recommendations.component.ts  — dark/light mode optimisé
// ──────────────────────────────────────────────────────────────
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

export interface RecommendedCourse {
  coursId: number;
  score: number;
  details?: {
    collaborative: number;
    content: number;
    popularity: number;
  };
}

export interface RecommendationResponse {
  userId: number;
  type: 'hybrid' | 'cold_start' | 'popularity_fallback';
  recommendations: RecommendedCourse[];
}

@Component({
  selector: 'app-ai-recommendations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ai-reco-root">

      <!-- Header -->
      <div class="reco-header">
        <div class="ai-badge">
          <span class="ai-icon">✦</span>
          <span>IA</span>
        </div>
        <div class="reco-title-block">
          <h2 class="reco-title">Cours recommandés pour vous</h2>
          <p class="reco-subtitle" *ngIf="responseType">
            <span class="type-pill" [class]="'type-' + responseType">{{ typeLabel }}</span>
          </p>
        </div>
        <button class="refresh-btn" (click)="load()" [disabled]="loading" title="Rafraîchir">
          <svg [class.spinning]="loading" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
      </div>

      <!-- Loading skeleton -->
      <div class="cards-grid" *ngIf="loading">
        <div class="course-card skeleton-card" *ngFor="let _ of [1,2,3,4,5]">
          <div class="sk-strip"></div>
          <div class="sk-ring"></div>
          <div class="sk-line sk-line-wide"></div>
          <div class="sk-line sk-line-mid"></div>
          <div class="sk-line sk-line-narrow"></div>
        </div>
      </div>

      <!-- État erreur -->
      <div class="state-box error-box" *ngIf="!loading && error">
        <span class="state-icon">⚠</span>
        <p class="state-msg">{{ error }}</p>
        <button class="retry-btn" (click)="load()">Réessayer</button>
      </div>

      <!-- État vide -->
      <div class="state-box empty-box" *ngIf="!loading && !error && recommendations.length === 0">
        <span class="state-icon">◎</span>
        <p class="state-msg">Aucune recommandation disponible pour le moment.</p>
      </div>

      <!-- Cartes recommandations -->
      <div class="cards-grid" *ngIf="!loading && !error && recommendations.length > 0">
        <div
          class="course-card"
          *ngFor="let course of recommendations; let i = index"
          [style.animation-delay]="i * 70 + 'ms'"
        >
          <!-- Rang -->
          <div class="rank-badge">#{{ i + 1 }}</div>

          <!-- Anneau score SVG -->
          <div class="score-ring-wrap">
            <svg class="score-ring" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
              <circle cx="30" cy="30" r="24" class="ring-bg"/>
              <circle
                cx="30" cy="30" r="24"
                class="ring-fill"
                [style.stroke-dasharray]="'150.8'"
                [style.stroke-dashoffset]="ringOffset(course.score)"
              />
            </svg>
            <span class="score-val">{{ (course.score * 100) | number:'1.0-0' }}<small>%</small></span>
          </div>

          <!-- Infos cours -->
          <div class="card-body">
            <h3 class="course-label">Cours #{{ course.coursId }}</h3>

            <!-- Barres détail (si dispo) -->
            <div class="score-bars" *ngIf="course.details">
              <div class="bar-row">
                <span class="bar-lbl">Collaboratif</span>
                <div class="bar-track">
                  <div class="bar-fill fill-collab" [style.width]="(course.details.collaborative * 100) + '%'"></div>
                </div>
                <span class="bar-pct">{{ (course.details.collaborative * 100) | number:'1.0-0' }}%</span>
              </div>
              <div class="bar-row">
                <span class="bar-lbl">Contenu</span>
                <div class="bar-track">
                  <div class="bar-fill fill-content" [style.width]="(course.details.content * 100) + '%'"></div>
                </div>
                <span class="bar-pct">{{ (course.details.content * 100) | number:'1.0-0' }}%</span>
              </div>
              <div class="bar-row">
                <span class="bar-lbl">Popularité</span>
                <div class="bar-track">
                  <div class="bar-fill fill-pop" [style.width]="(course.details.popularity * 100) + '%'"></div>
                </div>
                <span class="bar-pct">{{ (course.details.popularity * 100) | number:'1.0-0' }}%</span>
              </div>
            </div>
          </div>

          <!-- CTA -->
          <button class="see-btn" (click)="onViewCourse(course.coursId)">
            Voir le cours <span class="see-arrow">→</span>
          </button>
        </div>
      </div>

      <!-- Zone admin -->
      <div class="admin-zone" *ngIf="isAdmin">
        <button class="retrain-btn" (click)="retrain()" [disabled]="retraining">
          <span *ngIf="!retraining">⟳ Réentraîner le modèle</span>
          <span *ngIf="retraining">Entraînement en cours…</span>
        </button>
      </div>

    </div>
  `,
  styleUrls: ['./ai-recommendations.component.css']
})
export class AiRecommendationsComponent implements OnInit {

  @Input() userId!: number;
  @Input() isAdmin = false;

  private readonly API = 'http://localhost:9000';

  recommendations: RecommendedCourse[] = [];
  responseType?: string;
  loading = true;
  error?: string;
  retraining = false;

  constructor(private http: HttpClient) {}

  get typeLabel(): string {
    const labels: Record<string, string> = {
      hybrid:               'Recommandation hybride',
      cold_start:           'Cours populaires (nouveau profil)',
      popularity_fallback:  'Cours tendance',
    };
    return labels[this.responseType ?? ''] ?? this.responseType ?? '';
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error   = undefined;

    this.http
      .get<RecommendationResponse>(`${this.API}/ai/recommend/${this.userId}`)
      .pipe(catchError(err => {
        this.error = err?.error?.detail ?? 'Impossible de charger les recommandations.';
        this.loading = false;
        return of(null);
      }))
      .subscribe(res => {
        if (res) {
          this.recommendations = res.recommendations;
          this.responseType    = res.type;
        }
        this.loading = false;
      });
  }

  retrain(): void {
    this.retraining = true;
    this.http
      .post(`${this.API}/ai/train`, {})
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.retraining = false;
        this.load();
      });
  }

  onViewCourse(coursId: number): void {
    console.log('Navigate to course', coursId);
  }

  ringOffset(score: number): number {
    const circumference = 2 * Math.PI * 24;
    return circumference * (1 - score);
  }
}