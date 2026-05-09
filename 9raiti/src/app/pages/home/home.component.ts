import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogueService } from '../../core/services/catalogue.service';
import { AuthService } from '../../core/services/auth.service';
import { UserStateService } from '../../core/services/user-state.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { CategorieDTO } from '../../models/categorie.model';
import { ModuleDTO } from '../../models/module.model';
import { FeedbackDTO, TypeAvis } from '../../models/feedback.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {

  /* ── State ─────────────────────────────────────────────── */
  isLoggedIn   = false;
  userRole     = '';
  navOpen      = false;
  scrolled     = false;
  activeCatId: number | null = null;

  categories: CategorieDTO[] = [];
  allModules: ModuleDTO[] = [];

  /** Modules actifs uniquement (actif === true) */
  get activeModules(): ModuleDTO[] {
    return this.allModules.filter(m => m.actif && (!m.statut || m.statut === 'ACTIF'));
  }

  /** Modules actifs filtrés par catégorie sélectionnée */
  get filteredModules(): ModuleDTO[] {
    if (!this.activeCatId) return [];
    return this.activeModules.filter(m => m.categorieId === this.activeCatId);
  }

  get activeCategoryName(): string {
    return this.categories.find(c => c.id === this.activeCatId)?.nom ?? '';
  }

  /* ── Hero Slider ────────────────────────────────────────── */
  slides = [
    { title: 'Apprendre sans limites',     subtitle: 'Des cours structurés, des quiz interactifs et un suivi personnalisé pour chaque apprenant.', label: 'Découvrez nos cours',       icon: '📚' },
    { title: 'Progressez à votre rythme',  subtitle: 'Accédez à des modules organisés par catégorie et avancez selon votre propre planning.',      label: 'Explorer les modules',      icon: '🚀' },
    { title: 'Des enseignants experts',    subtitle: 'Nos formateurs certifiés créent des contenus de qualité pour vous accompagner.',              label: 'Rejoindre la plateforme',   icon: '🎓' },
  ];
  currentSlide = 0;
  private slideInterval?: ReturnType<typeof setInterval>;

  /* ── Feedback / Réclamation ─────────────────────────────── */
  feedbackEmail   = '';
  feedbackType: TypeAvis | '' = '';
  feedbackMessage = '';
  claimSent       = false;
  claimLoading    = false;
  claimError      = '';

  readonly typesAvis: { value: TypeAvis; label: string }[] = [
    { value: 'RECLAMATION',         label: 'Réclamation' },
    { value: 'FEEDBACK_PLATEFORME', label: 'Feedback sur la plateforme' },
    { value: 'SUGGESTION',          label: "Suggestion d'amélioration" },
    { value: 'BUG',                 label: 'Signalement de bug' },
    { value: 'AVIS_COURS',          label: 'Avis sur un cours' },
    { value: 'AUTRE',               label: 'Autre' },
  ];

  /* ── Testimonials ───────────────────────────────────────── */
  testimonials = [
    { name: 'Yasmine B.', role: 'Étudiante en informatique', text: "La plateforme 9raiti m'a permis de consolider mes bases en programmation en seulement 3 mois. Les cours sont clairs et bien structurés.", avatar: 'YB', color: '#F59E0B' },
    { name: 'Karim M.',   role: 'Développeur web junior',    text: "J'ai adoré la progression pédagogique. On passe naturellement du débutant à l'intermédiaire sans se sentir perdu.",              avatar: 'KM', color: '#10b981' },
    { name: 'Nadia R.',   role: 'Enseignante lycée',         text: "En tant qu'enseignante, j'ai aussi appris de nouvelles choses. L'interface est intuitive et les ressources sont top !",            avatar: 'NR', color: '#8b5cf6' },
    { name: 'Amine T.',   role: 'Apprenant autodidacte',     text: "Les quiz à la fin de chaque module sont très utiles pour valider ses acquis. Je recommande 9raiti à tous mes amis.",                avatar: 'AT', color: '#3b82f6' },
  ];

  /* ── Stats ──────────────────────────────────────────────── */
  stats = [
    { value: '1 200+', label: 'Apprenants inscrits',  icon: '👩‍🎓' },
    { value: '80+',    label: 'Cours disponibles',    icon: '📖'  },
    { value: '15+',    label: 'Enseignants experts',  icon: '👨‍🏫' },
    { value: '95%',    label: 'Taux de satisfaction', icon: '⭐'  },
  ];

  team = [
    { name: 'Mohamed A.', role: 'Fondateur & Dev',          avatar: 'MA', color: '#F59E0B' },
    { name: 'Fatima Z.',  role: 'Responsable pédagogique',  avatar: 'FZ', color: '#10b981' },
    { name: 'Youssef K.', role: 'Lead enseignant',          avatar: 'YK', color: '#8b5cf6' },
    { name: 'Sara B.',    role: 'UX / Design',              avatar: 'SB', color: '#3b82f6' },
  ];

  features = [
    { icon: '🎯', title: 'Apprentissage ciblé', desc: "Des parcours adaptés à votre niveau et vos objectifs." },
    { icon: '📱', title: 'Accessible partout',  desc: "Apprenez depuis n'importe quel appareil." },
    { icon: '🏆', title: 'Certifications',       desc: "Validez votre progression avec des badges." },
    { icon: '🤝', title: 'Communauté active',    desc: "Échangez avec d'autres apprenants." },
  ];

  footerCols = [
    { title: 'Plateforme',   links: ['Catalogue', 'Catégories', 'Modules'] },
    { title: 'Compte',       links: ['Connexion', 'Inscription', 'Mon profil', 'Tableau de bord'] },
    { title: 'Informations', links: ['À propos', 'Témoignages', 'Réclamation', 'Confidentialité'] },
  ];

  socialLinks = [
    { label: 'f', name: 'Facebook' },
    { label: 'in', name: 'LinkedIn' },
    { label: 'tw', name: 'Twitter' },
  ];

  constructor(
    private catalogue: CatalogueService,
    private auth: AuthService,
    private userStateService: UserStateService,
    private router: Router,
    private feedbackService: FeedbackService,
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.userRole   = this.auth.getRole()?.toLowerCase() ?? '';
    this.userStateService.user$.subscribe(u => {
      this.userRole = u?.role?.toLowerCase() ?? '';
      this.isLoggedIn = !!u && this.auth.isLoggedIn();
    });
    this.loadCatalogue();
    this.startSlider();
  }

  ngOnDestroy(): void {
    clearInterval(this.slideInterval);
  }

loadCatalogue(): void {
  // ✅ Vider le cache pour toujours avoir des données fraîches sur la home
  this.catalogue.clearCache();

  this.catalogue.getAllCategories().subscribe({
    next: c => {
      this.categories = c;
      // ✅ Sélectionner automatiquement la première catégorie si aucune sélectionnée
      if (this.categories.length > 0 && !this.activeCatId) {
        this.activeCatId = this.categories[0].id!;
      }
    },
    error: () => { this.categories = []; }
  });

  this.catalogue.getAllModules().subscribe({
    next: m => {
      this.allModules = m;
    },
    error: () => { this.allModules = []; }
  });
}

  setCategory(id: number): void {
    this.activeCatId = this.activeCatId === id ? null : id;
  }

  /** Nombre de modules ACTIFS pour une catégorie donnée */
  getActiveModulesCount(catId: number): number {
    return this.activeModules.filter(m => m.categorieId === catId).length;
  }

  startSlider(): void {
    this.slideInterval = setInterval(() => this.nextSlide(), 5000);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  goToSlide(i: number): void {
    this.currentSlide = i;
    clearInterval(this.slideInterval);
    this.startSlider();
  }

  /** Retourne la route du dashboard selon le rôle connecté */
  getDashboardRoute(): string {
    if (this.userRole === 'apprenant')  return '/dashboard-apprenant';
    if (this.userRole === 'enseignant') return '/dashboard-enseignant';
    if (this.userRole === 'admin')      return '/dashboard-admin';
    return '/categories';
  }

  /** CTA → login si non connecté, sinon dashboard selon rôle */
  ctaAction(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigateByUrl(this.getDashboardRoute());
    }
  }

  /** Accéder aux modules d'une catégorie (nécessite authentification) */
  goToModules(catId: number, catNom: string): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/modules'], { queryParams: { categorieId: catId, categorieNom: catNom } });
  }

  /** Soumission du feedback anonyme depuis la page Home */
  submitClaim(): void {
    if (!this.feedbackEmail || !this.feedbackMessage || !this.feedbackType) return;

    this.claimLoading = true;
    this.claimError   = '';

    const dto: FeedbackDTO = {
      email:    this.feedbackEmail,
      typeAvis: this.feedbackType as TypeAvis,
      message:  this.feedbackMessage,
    };

    this.feedbackService.soumettreAnonyme(dto).subscribe({
      next: () => {
        this.claimLoading   = false;
        this.claimSent      = true;
        this.feedbackEmail   = '';
        this.feedbackType    = '';
        this.feedbackMessage = '';
        setTimeout(() => this.claimSent = false, 5000);
      },
      error: (err: Error) => {
        this.claimLoading = false;
        this.claimError   = err.message;
      }
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 40;
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    this.navOpen = false;
  }
}
