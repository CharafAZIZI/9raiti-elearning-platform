import { Routes } from '@angular/router';
import { authGuard, roleGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
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
    loadComponent: () => import('./pages/forgot-password/forgot-password.component')
      .then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reinitialiser-mot-de-passe',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/reset-password/reset-password.component')
      .then(m => m.ResetPasswordComponent)
  },
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
  {
    path: 'profil',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'en-attente',
    loadComponent: () => import('./pages/pending-validation/pending-validation.component').then(m => m.PendingValidationComponent)
  },

  // ── Catalogue (apprenant) ─────────────────────────────────
  {
    path: 'categories',
    canActivate: [authGuard, roleGuard('apprenant')],
    loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent)
  },
  {
    path: 'modules',
    canActivate: [authGuard, roleGuard('apprenant')],
    loadComponent: () => import('./pages/modules/modules.component').then(m => m.ModulesComponent)
  },
  {
    path: 'cours',
    canActivate: [authGuard, roleGuard('apprenant')],
    loadComponent: () => import('./pages/cours/cours.component').then(m => m.CoursComponent)
  },

  { path: '**', redirectTo: '' }
];
