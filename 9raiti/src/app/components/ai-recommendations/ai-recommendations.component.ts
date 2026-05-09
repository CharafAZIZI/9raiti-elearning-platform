// ──────────────────────────────────────────────────────────────
// ai-recommendations.component.ts
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
    <section class="ai-reco-section">

      <!-- Header -->
      <div class="reco-header">
        <div class="ai-badge">
          <span class="ai-icon">✦</span>
          <span>IA</span>
        </div>
        <div class="reco-title-block">
          <h2 class="reco-title">Cours recommandés pour vous</h2>
          <p class="reco-subtitle" *ngIf="responseType">
            <span class="type-pill" [class]="'type-' + responseType">
              {{ typeLabel }}
            </span>
          </p>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div class="cards-grid" *ngIf="loading">
        <div class="course-card skeleton" *ngFor="let _ of [1,2,3,4,5]">
          <div class="sk-badge"></div>
          <div class="sk-title"></div>
          <div class="sk-bar"></div>
          <div class="sk-chips"></div>
        </div>
      </div>

      <!-- Error state -->
      <div class="error-state" *ngIf="!loading && error">
        <span class="error-icon">⚠</span>
        <p>{{ error }}</p>
        <button class="retry-btn" (click)="load()">Réessayer</button>
      </div>

      <!-- Empty state -->
      <div class="empty-state" *ngIf="!loading && !error && recommendations.length === 0">
        <span class="empty-icon">◎</span>
        <p>Aucune recommandation disponible pour le moment.</p>
      </div>

      <!-- Recommendation cards -->
      <div class="cards-grid" *ngIf="!loading && !error && recommendations.length > 0">
        <div
          class="course-card"
          *ngFor="let course of recommendations; let i = index"
          [style.animation-delay]="i * 80 + 'ms'"
        >
          <!-- Rank badge -->
          <div class="rank-badge">
            <span class="rank-num">#{{ i + 1 }}</span>
          </div>

          <!-- Score ring -->
          <div class="score-ring-wrap">
            <svg class="score-ring" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="24" class="ring-bg"/>
              <circle
                cx="30" cy="30" r="24"
                class="ring-fill"
                [style.stroke-dasharray]="'150.8'"
                [style.stroke-dashoffset]="ringOffset(course.score)"
              />
            </svg>
            <span class="score-value">{{ (course.score * 100) | number:'1.0-0' }}<small>%</small></span>
          </div>

          <!-- Course info -->
          <div class="card-body">
            <h3 class="course-id">Cours #{{ course.coursId }}</h3>

            <!-- Score breakdown bars (if details available) -->
            <div class="score-bars" *ngIf="course.details">
              <div class="bar-row">
                <span class="bar-label">Collaboratif</span>
                <div class="bar-track">
                  <div class="bar-fill collab" [style.width]="(course.details.collaborative * 100) + '%'"></div>
                </div>
                <span class="bar-val">{{ (course.details.collaborative * 100) | number:'1.0-0' }}%</span>
              </div>
              <div class="bar-row">
                <span class="bar-label">Contenu</span>
                <div class="bar-track">
                  <div class="bar-fill content" [style.width]="(course.details.content * 100) + '%'"></div>
                </div>
                <span class="bar-val">{{ (course.details.content * 100) | number:'1.0-0' }}%</span>
              </div>
              <div class="bar-row">
                <span class="bar-label">Popularité</span>
                <div class="bar-track">
                  <div class="bar-fill pop" [style.width]="(course.details.popularity * 100) + '%'"></div>
                </div>
                <span class="bar-val">{{ (course.details.popularity * 100) | number:'1.0-0' }}%</span>
              </div>
            </div>
          </div>

          <!-- CTA -->
          <button class="see-btn" (click)="onViewCourse(course.coursId)">
            Voir le cours <span>→</span>
          </button>
        </div>
      </div>

      <!-- Retrain button (admin only) -->
      <div class="admin-zone" *ngIf="isAdmin">
        <button class="retrain-btn" (click)="retrain()" [disabled]="retraining">
          <span *ngIf="!retraining">⟳ Réentraîner le modèle</span>
          <span *ngIf="retraining">Entraînement en cours…</span>
        </button>
      </div>

    </section>
  `,
  styles: [`
    /* ── Tokens ─────────────────────────────────────────── */
    :host {
      --ai-accent:    #6366f1;
      --ai-accent2:   #8b5cf6;
      --ai-collab:    #06b6d4;
      --ai-content:   #10b981;
      --ai-pop:       #f59e0b;
      --card-bg:      #ffffff;
      --card-border:  #e5e7eb;
      --text-primary: #111827;
      --text-muted:   #6b7280;
      --bg-section:   #f9fafb;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }

    /* ── Section wrapper ─────────────────────────────────── */
    .ai-reco-section {
      padding: 2rem 0;
    }

    /* ── Header ──────────────────────────────────────────── */
    .reco-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .ai-badge {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      background: linear-gradient(135deg, var(--ai-accent), var(--ai-accent2));
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      flex-shrink: 0;
    }
    .ai-icon { font-size: 0.9rem; }
    .reco-title {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .reco-subtitle { margin: 0.25rem 0 0; }
    .type-pill {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
    }
    .type-hybrid             { background: #ede9fe; color: #6d28d9; }
    .type-cold_start         { background: #dbeafe; color: #1d4ed8; }
    .type-popularity_fallback{ background: #fef3c7; color: #92400e; }

    /* ── Cards grid ──────────────────────────────────────── */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
    }

    /* ── Course card ─────────────────────────────────────── */
    .course-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      position: relative;
      box-shadow: 0 1px 3px rgba(0,0,0,.06);
      animation: cardIn 0.4s ease both;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .course-card:hover {
      box-shadow: 0 8px 24px rgba(99,102,241,.13);
      transform: translateY(-3px);
    }
    @keyframes cardIn {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* rank badge */
    .rank-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: var(--bg-section);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 0.15rem 0.5rem;
    }
    .rank-num { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); }

    /* score ring */
    .score-ring-wrap {
      position: relative;
      width: 60px;
      height: 60px;
    }
    .score-ring { width: 60px; height: 60px; transform: rotate(-90deg); }
    .ring-bg  { fill: none; stroke: #e5e7eb; stroke-width: 5; }
    .ring-fill{
      fill: none;
      stroke: var(--ai-accent);
      stroke-width: 5;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.6s ease;
    }
    .score-value {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      font-weight: 800;
      color: var(--text-primary);
    }
    .score-value small { font-size: 0.55rem; font-weight: 600; color: var(--text-muted); margin-top: 2px; }

    /* card body */
    .card-body { flex: 1; display: flex; flex-direction: column; gap: 0.6rem; }
    .course-id  { margin: 0; font-size: 1rem; font-weight: 700; color: var(--text-primary); }

    /* score bars */
    .score-bars { display: flex; flex-direction: column; gap: 0.4rem; }
    .bar-row    { display: flex; align-items: center; gap: 0.4rem; }
    .bar-label  { font-size: 0.65rem; color: var(--text-muted); width: 68px; flex-shrink: 0; }
    .bar-track  { flex: 1; height: 5px; background: #f3f4f6; border-radius: 99px; overflow: hidden; }
    .bar-fill   { height: 100%; border-radius: 99px; transition: width 0.7s ease; }
    .collab     { background: var(--ai-collab); }
    .content    { background: var(--ai-content); }
    .pop        { background: var(--ai-pop); }
    .bar-val    { font-size: 0.62rem; color: var(--text-muted); width: 28px; text-align: right; }

    /* CTA button */
    .see-btn {
      margin-top: auto;
      padding: 0.55rem 1rem;
      background: linear-gradient(135deg, var(--ai-accent), var(--ai-accent2));
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: opacity 0.15s, transform 0.15s;
    }
    .see-btn:hover { opacity: 0.9; transform: scale(1.02); }

    /* ── Skeleton ────────────────────────────────────────── */
    .skeleton { pointer-events: none; }
    .sk-badge, .sk-title, .sk-bar, .sk-chips {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
      border-radius: 8px;
    }
    .sk-badge  { width: 48px; height: 20px; }
    .sk-title  { width: 80%; height: 18px; margin-top: 0.5rem; }
    .sk-bar    { width: 100%; height: 8px; margin-top: 0.75rem; }
    .sk-chips  { width: 60%; height: 8px; margin-top: 0.4rem; }
    @keyframes shimmer {
      from { background-position: 200% 0; }
      to   { background-position: -200% 0; }
    }

    /* ── Error / Empty ───────────────────────────────────── */
    .error-state, .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--text-muted);
    }
    .error-icon, .empty-icon { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
    .retry-btn {
      margin-top: 0.75rem;
      padding: 0.5rem 1.25rem;
      border: 1px solid var(--ai-accent);
      color: var(--ai-accent);
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    /* ── Admin zone ──────────────────────────────────────── */
    .admin-zone { margin-top: 1.5rem; text-align: right; }
    .retrain-btn {
      padding: 0.5rem 1.25rem;
      background: transparent;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      transition: border-color 0.15s, color 0.15s;
    }
    .retrain-btn:hover:not(:disabled) { border-color: var(--ai-accent); color: var(--ai-accent); }
    .retrain-btn:disabled { opacity: 0.5; cursor: default; }
  `]
})
export class AiRecommendationsComponent implements OnInit {

  /** ID de l'utilisateur connecté — injecter depuis AuthService en production */
  @Input() userId!: number;
  @Input() isAdmin = false;

  /** URL de l'API Gateway */
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
        this.load();          // Recharger après entraînement
      });
  }

  onViewCourse(coursId: number): void {
    // Naviguer vers la page du cours — adapter selon votre Router
    console.log('Navigate to course', coursId);
    // this.router.navigate(['/cours', coursId]);
  }

  /** Calcule le stroke-dashoffset pour l'anneau SVG */
  ringOffset(score: number): number {
    const circumference = 2 * Math.PI * 24; // r=24 → ~150.8
    return circumference * (1 - score);
  }
}