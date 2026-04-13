# 9raiti — Plateforme E-learning Angular

## Description

**9raiti** est une plateforme e-learning développée avec Angular (standalone components), connectée à un backend Spring Boot via une API REST. Elle gère une hiérarchie de contenu **Catégories → Modules → Cours** avec un système de rôles strict.

---

## Architecture du projet

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   └── auth.guard.ts          # authGuard, roleGuard, guestGuard
│   │   ├── interceptors/
│   │   │   └── jwt.interceptor.ts     # Injection automatique du Bearer token
│   │   └── services/
│   │       ├── auth.service.ts        # Login, register, logout, Google OAuth
│   │       ├── catalogue.service.ts   # CRUD Catégories / Modules / Cours
│   │       ├── token.service.ts       # JWT storage, rôle, expiration
│   │       ├── profile.service.ts     # Profil utilisateur
│   │       ├── admin-user.service.ts  # Gestion utilisateurs (Admin)
│   │       ├── theme.service.ts       # Thème clair/sombre
│   │       └── user-state.service.ts  # État utilisateur global
│   ├── models/
│   │   ├── categorie.model.ts         # CategorieDTO
│   │   ├── module.model.ts            # ModuleDTO, StatutModule
│   │   ├── cours.model.ts             # CoursDTO, Niveau, StatutCours
│   │   ├── login.model.ts
│   │   ├── register.model.ts
│   │   └── password.model.ts
│   ├── pages/
│   │   ├── home/                      # Landing page publique
│   │   ├── login/                     # Authentification
│   │   ├── register/                  # Inscription
│   │   ├── forgot-password/           # Réinitialisation mot de passe
│   │   ├── reset-password/
│   │   ├── pending-validation/        # Attente de validation enseignant
│   │   ├── categories/                # Liste catégories (authentifié)
│   │   ├── modules/                   # Liste modules (authentifié, filtré par rôle)
│   │   ├── cours/                     # Liste cours (authentifié, filtré par rôle)
│   │   ├── dashboard-apprenant/       # Tableau de bord apprenant
│   │   ├── dashboard-enseignant/      # Tableau de bord enseignant avec CRUD
│   │   ├── dashboard-admin/           # Tableau de bord admin complet
│   │   └── profile/                   # Profil utilisateur
│   └── shared/
│       └── components/
│           └── navbar/                # Barre de navigation partagée
├── environments/
│   └── environment.ts                 # URLs API (apiUrl, springApiUrl)
└── index.html                         # Point d'entrée, variables CSS globales
```

---

## Rôles et règles métier

### 🎓 Apprenant

| Élément         | Règle d'affichage                                           |
|-----------------|-------------------------------------------------------------|
| **Catégories**  | Toutes visibles (elles n'ont pas de statut)                 |
| **Modules**     | Uniquement les modules avec `statut = ACTIF` (`actif=true`) |
| **Cours**       | Uniquement les cours `PUBLIÉ` dont le **module parent est ACTIF** |
| **Module BROUILLON ou ARCHIVÉ** | Totalement masqué, **même si ses cours sont publiés** |

> Règle clé : un cours publié rattaché à un module non-actif est **invisible** pour l'apprenant.

### 👨‍🏫 Enseignant

- Accès complet à **tous les modules** (ACTIF, BROUILLON, ARCHIVÉ).
- Accès complet à **tous les cours** (PUBLIÉ, BROUILLON, ARCHIVÉ).
- Peut créer/modifier des modules et des cours depuis son tableau de bord.

### 🔐 Admin

- Accès complet sans restriction.
- Section **"Gestion du Contenu"** dans le tableau de bord :
  - CRUD complet des **Catégories** (nom, description)
  - CRUD complet des **Modules** (nom, code, description, statut : ACTIF / BROUILLON / ARCHIVÉ, catégorie)
  - CRUD complet des **Cours** (titre, description, niveau, statut, durée, module parent)
- Section **"Gestion des Utilisateurs"** : validation, suspension, rôles.

---

## Statuts des Modules

| Statut       | Apprenant | Enseignant | Admin |
|--------------|-----------|------------|-------|
| `ACTIF`      | ✅ Visible | ✅ Visible  | ✅ Visible |
| `BROUILLON`  | ❌ Masqué  | ✅ Visible  | ✅ Visible |
| `ARCHIVE`    | ❌ Masqué  | ✅ Visible  | ✅ Visible |

## Statuts des Cours

| Statut       | Apprenant (si module ACTIF) | Enseignant | Admin |
|--------------|-----------------------------|------------|-------|
| `PUBLIE`     | ✅ Visible                  | ✅ Visible  | ✅ Visible |
| `BROUILLON`  | ❌ Masqué                   | ✅ Visible  | ✅ Visible |
| `ARCHIVE`    | ❌ Masqué                   | ✅ Visible  | ✅ Visible |

---

## Page Home (publique)

- **Première page** de l'application (route `/`).
- Affiche les **catégories** et les **modules actifs uniquement**.
- **Aucun accès direct aux cours** depuis la Home.
- Cliquer sur "Voir les cours" d'un module → redirige vers `/login` si non connecté.
- Contenu : hero slider, catalogue filtré, statistiques, témoignages, formulaire de réclamation, équipe, footer.

---

## Sécurité et Guards

| Route            | Guard appliqué           | Comportement                              |
|------------------|--------------------------|-------------------------------------------|
| `/`              | aucun                    | Accessible à tous                         |
| `/login`         | `guestGuard`             | Redirige vers dashboard si déjà connecté  |
| `/register`      | `guestGuard`             | Redirige vers dashboard si déjà connecté  |
| `/cours`         | `authGuard`              | Redirige vers `/login` si non connecté    |
| `/modules`       | `authGuard`              | Redirige vers `/login` si non connecté    |
| `/categories`    | `authGuard`              | Redirige vers `/login` si non connecté    |
| `/dashboard-admin` | `authGuard + roleGuard('admin')` | Redirige si mauvais rôle      |
| `/dashboard-enseignant` | `authGuard + roleGuard('enseignant')` | Redirige si mauvais rôle |
| `/dashboard-apprenant` | `authGuard + roleGuard('apprenant')` | Redirige si mauvais rôle  |

---

## Installation et lancement

### Prérequis
- Node.js ≥ 18
- Angular CLI ≥ 17
- Backend Spring Boot démarré sur `http://localhost:8080`

### Installation

```bash
git clone <url-du-repo>
cd 9raiti
npm install
```

### Lancement

```bash
ng serve
# ou avec le proxy configuré
ng serve --proxy-config proxy.conf.json
```

L'application est accessible sur `http://localhost:4200`.

### Variables d'environnement

Fichier `src/environments/environment.ts` :
```ts
export const environment = {
  production: false,
  apiUrl: '/api',           // Auth endpoints (Spring Security)
  springApiUrl: '/spring-api' // Catalogue endpoints (Spring Boot)
};
```

Le proxy (`proxy.conf.json`) redirige `/spring-api` vers `http://localhost:8080/api`.

---

## Technologies utilisées

| Technologie       | Version  | Usage                              |
|-------------------|----------|------------------------------------|
| Angular           | 17+      | Framework frontend (standalone)    |
| TypeScript        | 5+       | Langage principal                  |
| TailwindCSS       | 3+       | Styles utilitaires                 |
| RxJS              | 7+       | Observables, forkJoin, shareReplay |
| Angular Reactive Forms | -   | Formulaires CRUD                   |
| Spring Boot       | 3+       | Backend REST API                   |
| JWT               | -        | Authentification stateless         |

---

## Règles de filtrage — Résumé

```
Apprenant accède à /cours :
  Pour chaque cours → visible si :
    ✓ cours.statut === 'PUBLIE'
    ✓ cours.moduleId.statut === 'ACTIF'   (actif === true)
    ✗ cours.statut === 'BROUILLON' → masqué
    ✗ cours.statut === 'ARCHIVE'  → masqué
    ✗ module parent BROUILLON/ARCHIVE → tous ses cours masqués

Enseignant et Admin accèdent à /cours :
  Tous les cours, tous statuts, tous modules.
```

---

## Docker

```bash
docker build -t 9raiti .
docker run -p 4200:80 9raiti
```

