import { Routes } from '@angular/router';
import { authGuard, roleGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
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

  { path: '**', redirectTo: 'login' }
];
