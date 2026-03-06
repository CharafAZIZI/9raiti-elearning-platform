# 9raiti — Interface Angular 17

Plateforme d'apprentissage en ligne connectée au microservice .NET d'authentification.

---

## 🚀 Installation et démarrage

```bash
# 1. Aller dans le dossier du projet
cd 9raiti

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
ng serve --open
# L'app sera disponible sur http://localhost:4200
```

---

## 📁 Structure du projet

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── auth.service.ts        ← Appels API (login, register, logout, Google)
│   │   │   └── token.service.ts       ← Gestion JWT dans localStorage
│   │   ├── guards/
│   │   │   └── auth.guard.ts          ← authGuard, roleGuard, guestGuard
│   │   └── interceptors/
│   │       └── jwt.interceptor.ts     ← Ajoute Bearer token automatiquement
│   ├── models/
│   │   ├── login.model.ts             ← LoginRequest, LoginResponse, LoginResult
│   │   └── register.model.ts          ← RegisterUserVM
│   ├── pages/
│   │   ├── login/                     ← Page de connexion + Google Login
│   │   ├── register/                  ← Inscription avec choix de rôle
│   │   ├── dashboard-apprenant/       ← Tableau de bord apprenant
│   │   ├── dashboard-enseignant/      ← Tableau de bord enseignant
│   │   └── pending-validation/        ← Page d'attente (enseignant non validé)
│   ├── shared/components/navbar/      ← Barre de navigation avec déconnexion
│   ├── app.routes.ts                  ← Routes protégées par rôle
│   └── app.config.ts                  ← Config HTTP + interceptors
└── environments/
    └── environment.ts                 ← apiUrl = http://localhost:5000/api
```

---

## 🔗 Connexion à l'API

Tous les appels passent par l'API Gateway sur **port 5000** :

| Action | Méthode | Endpoint |
|--------|---------|----------|
| Inscription | POST | `http://localhost:5000/api/auth` |
| Connexion | POST | `http://localhost:5000/api/auth/login` |
| Connexion Google | POST | `http://localhost:5000/api/auth/google-login` |
| Déconnexion | POST | `http://localhost:5000/api/auth/logout` |

---

## 🔐 Logique des rôles

### Inscription (`/register`)
- L'utilisateur choisit entre **Apprenant** ou **Enseignant**
- Si **Apprenant** → inscription directe, redirection vers `/login`
- Si **Enseignant** → message d'avertissement visible + après inscription → message de succès expliquant la validation

### Connexion (`/login`)
- Succès → redirection automatique selon le rôle :
  - `apprenant` → `/dashboard-apprenant`
  - `enseignant` → `/dashboard-enseignant`
- Erreur 401 → "Email ou mot de passe incorrect"
- Erreur 403 → "Compte en attente de validation"

### Guards
- `authGuard` : protège toutes les routes dashboard
- `roleGuard('apprenant')` : seuls les apprenants accèdent à `/dashboard-apprenant`
- `roleGuard('enseignant')` : seuls les enseignants accèdent à `/dashboard-enseignant`
- `guestGuard` : empêche l'accès à login/register si déjà connecté

---

## ⚠️ Configuration CORS

Vérifiez que votre .NET Program.cs autorise `http://localhost:4200` :

```csharp
policy.WithOrigins("http://localhost:4200", "http://localhost:5184")
      .AllowAnyHeader()
      .AllowAnyMethod();
```

---

## 🎨 Design

- **Polices** : Lora (titres) + Source Sans 3 (corps)
- **Couleurs** : Bleu académique `#1a5f7a` + Ambre `#e8a020`
- **Responsive** : Panel gauche masqué sur mobile
- Importez les styles depuis `src/styles.css` dans chaque composant

---

## 📌 Notes importantes

1. Le JWT est stocké dans `localStorage` sous la clé `auth_token`
2. L'interceptor `jwt.interceptor.ts` ajoute automatiquement `Authorization: Bearer <token>` à chaque requête HTTP
3. La page `/en-attente` est accessible après inscription en tant qu'enseignant (optionnel selon votre logique backend)
4. Pour le Google Login, le `ClientId` est déjà configuré dans `login.component.ts`
