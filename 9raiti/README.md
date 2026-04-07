# 9raiti — Projet Angular Fusionné (v4 + v5)

Application Angular 17 (Standalone Components) pour une plateforme d'e-learning multi-rôles (Apprenant, Enseignant, Admin).

---

## Architecture

```
src/
├── app/
│   ├── core/
│   │   ├── guards/         # authGuard, roleGuard, guestGuard
│   │   ├── interceptors/   # jwtInterceptor (attach token + 401 → logout auto)
│   │   └── services/       # auth, catalogue, profile, admin-user, token, theme, user-state
│   ├── models/             # CategorieDTO, ModuleDTO, CoursDTO, LoginRequest/Response, RegisterUserVM
│   ├── pages/
│   │   ├── login/
│   │   ├── register/
│   │   ├── pending-validation/
│   │   ├── dashboard-admin/        # Gestion utilisateurs (CRUD réel via API .NET)
│   │   ├── dashboard-apprenant/    # Tableau de bord apprenant
│   │   ├── dashboard-enseignant/   # CRUD Catégories / Modules / Cours (API Spring Boot)
│   │   ├── categories/             # Catalogue catégories (lecture)
│   │   ├── modules/                # Catalogue modules (lecture)
│   │   └── cours/                  # Catalogue cours (lecture + PDF viewer)
│   ├── shared/
│   │   └── components/navbar/      # Navbar réactive (thème, user state, logout)
│   └── ...
├── environments/
│   └── environment.ts              # apiUrl (.NET 5000) + springApiUrl (Spring Boot 8080)
└── styles.css                      # Variables CSS globales (dark/light mode)
```

---

## Backends requis

| Backend | Port | Routes couvertes |
|---------|------|-----------------|
| API .NET (Gateway) | 5000 | `/api/auth/*`, `/api/profile`, `/api/users/*` |
| API Spring Boot | 8080 | `/api/categories/*`, `/api/modules/*`, `/api/cours/*` |

---

## Installation et démarrage

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer en développement (proxy vers les deux backends)
npm start
# ou
ng serve --proxy-config proxy.conf.json
```

Le proxy Angular est configuré dans `proxy.conf.json` :
- `/api/*` → `http://localhost:5000` (API .NET)
- `/spring-api/*` → `http://localhost:8080/api/*` (Spring Boot)

---

## Ce qui a été fusionné (v4 → v5)

| Élément | Source | Raison |
|---------|--------|--------|
| `CatalogueService` | v4 + v5 | CRUD complet (v4) + cache `shareReplay` + gestion erreurs (v5) |
| `dashboard-enseignant` | v4 | CRUD API réel (catégories / modules / cours / upload PDF) |
| `jwt.interceptor` | v5 | Gestion automatique 401 → déconnexion |
| `environment.ts` | Fusionné | Double URL : `.NET` (5000) + `Spring Boot` (8080) |
| `proxy.conf.json` | Fusionné | Double proxy : `/api` + `/spring-api` |
| Toutes les autres pages | v5 | Version la plus récente |

---

## Rôles et redirections

| Rôle | Route après login |
|------|------------------|
| `apprenant` | `/dashboard-apprenant` |
| `enseignant` | `/dashboard-enseignant` |
| `admin` | `/dashboard-admin` |
| Enseignant non validé | `/en-attente` |

---

## Fonctionnalités

- **Authentification** : Login/Register + Google OAuth2
- **Gestion des thèmes** : Dark / Light (persisté dans localStorage)
- **Admin** : Gestion complète des utilisateurs (valider, activer, suspendre, supprimer)
- **Enseignant** : CRUD Catégories, Modules, Cours + upload PDF
- **Apprenant** : Navigation catalogue (catégories → modules → cours) + lecture PDF
- **Sécurité** : JWT interceptor, guards par rôle, expiration token

---

## Commandes utiles

```bash
npm start          # Démarrage développement
npm run build      # Build production
```
