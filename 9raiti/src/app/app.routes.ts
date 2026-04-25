import { Routes } from '@angular/router';
import { authGuard, roleGuard, guestGuard, multiRoleGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // ── Racine ────────────────────────────────────────────────────────────────
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },

  // ── Authentification (invités seulement) ──────────────────────────────────
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'mot-de-passe-oublie',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reinitialiser-mot-de-passe',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'en-attente',
    loadComponent: () => import('./pages/pending-validation/pending-validation.component').then(m => m.PendingValidationComponent)
  },
  {
    path: 'email-confirme',
    loadComponent: () => import('./pages/email-confirme/email-confirme.component').then(m => m.EmailConfirmeComponent)
  },
  {
    path: 'email-invalide',
    loadComponent: () => import('./pages/email-invalide/email-invalide.component').then(m => m.EmailInvalideComponent)
  },

  // ── Dashboards (rôle strict) ───────────────────────────────────────────────
  {
    path: 'dashboard-apprenant',
    canActivate: [authGuard, roleGuard('apprenant')],
    loadComponent: () => import('./pages/dashboard-apprenant/dashboard-apprenant.component').then(m => m.DashboardApprenantComponent)
  },
  {
    path: 'dashboard-enseignant',
    canActivate: [authGuard, roleGuard('enseignant')],
    loadComponent: () => import('./pages/dashboard-enseignant/dashboard-enseignant.component').then(m => m.DashboardEnseignantComponent)
  },
  {
    path: 'dashboard-admin',
    canActivate: [authGuard, roleGuard('admin')],
    loadComponent: () => import('./pages/dashboard-admin/dashboard-admin.component').then(m => m.DashboardAdminComponent)
  },

  // ── Profil (tout utilisateur connecté) ────────────────────────────────────
  {
    path: 'profil',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  },

  // ── Catalogue public (lecture) ────────────────────────────────────────────
  {
    path: 'categories',
    loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent)
  },
  {
    path: 'modules',
    loadComponent: () => import('./pages/modules/modules.component').then(m => m.ModulesComponent)
  },

  // ── Cours : lecture publique, détail nécessite connexion ─────────────────
  {
    path: 'cours',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/cours/cours.component').then(m => m.CoursComponent)
  },
  {
    path: 'cours/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/cours-detail/cours-detail.component').then(m => m.CoursDetailComponent)
  },

  // ── Wildcard ──────────────────────────────────────────────────────────────
  { path: '**', redirectTo: 'home' }
];
