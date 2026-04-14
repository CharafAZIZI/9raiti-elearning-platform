# 9raiti — Plateforme E-learning Angular

## 🚀 Démarrage rapide

```bash
docker-compose up --build
```

| Service        | URL                           |
|----------------|-------------------------------|
| Angular        | http://localhost:4200          |
| API Gateway    | http://localhost:9000          |
| Spring Boot    | interne : spring-service:8080  |
| MinIO API S3   | http://localhost:9002          |
| MinIO Console  | http://localhost:9003          |
| PostgreSQL     | localhost:5433                 |
| SQL Server     | localhost:1434                 |

**Console MinIO :** http://localhost:9003 — login `minioadmin` / `REMOVED_PASSWORD`

---

## 📐 Architecture Angular

```
src/app/
├── core/
│   ├── guards/         auth.guard.ts
│   ├── interceptors/   jwt.interceptor.ts
│   └── services/       auth, catalogue, admin-user, token, theme…
├── models/             categorie, module, cours, login, register…
└── pages/
    ├── home/                   Page d'accueil publique
    ├── dashboard-admin/        Tableau de bord Administrateur ✨
    ├── dashboard-enseignant/   Tableau de bord Enseignant
    ├── dashboard-apprenant/    Tableau de bord Apprenant
    ├── categories/             Liste catégories
    ├── modules/                Liste modules
    ├── cours/                  Liste cours par module
    └── cours-detail/           Lecture cours + MinIO
```

---

## ✨ Nouveautés (dernière mise à jour)

### 1. Code de module — nouvelle regex

Le champ **Code** dans les formulaires Module (Admin & Enseignant) respecte désormais
le format `PREFIXE-NUMERO` :

| Valide ✅ | Invalide ❌ |
|-----------|------------|
| `SPR-1`   | `SPRING`   |
| `DOT-2`   | `ALG-L1`   |
| `ML-10`   | `123-ABC`  |
| `JAVA-3`  | `SP_R-1`   |

**Règle :** 2 à 10 lettres majuscules, un tiret, puis un ou plusieurs chiffres.  
Regex : `^[A-Z]{2,10}-\d+$`

Le champ passe automatiquement en majuscules à la saisie.

---

### 2. Vue hiérarchique — onglet 🗂️

Dans le dashboard Admin → **Gestion Contenu** → onglet **🗂️ Vue hiérarchique** :

- Accordéon imbriqué **Catégories → Modules → Cours** sur une seule page
- Cliquer sur une catégorie déroule ses modules
- Cliquer sur un module déroule ses cours
- Boutons **✏️ Modifier** et **🗑️ Supprimer** disponibles à chaque niveau
- Bouton **+ Module** sur chaque catégorie : ouvre le formulaire module pré-rempli avec la catégorie
- Bouton **+ Cours** sur chaque module : ouvre le formulaire cours pré-rempli avec le module
- Section **"Modules sans catégorie"** pour les modules non classés

Aucune navigation entre pages n'est nécessaire — tout le CRUD se fait en place via les modals existants.

---

### 3. Formulaires CRUD améliorés

Les modals (Catégorie, Module, Cours) dans le dashboard Admin :

- **Validation en temps réel** avec messages d'erreur contextuels
- **Champ Code** : format clairement indiqué, auto-majuscule
- **Feedback utilisateur** : messages succès/erreur animés (4–5 s)
- **Loading states** sur les boutons de soumission

---

### 4. Page Home — contrôle d'accès amélioré

Dans la section **Catalogue** de la page d'accueil :

- Les catégories et modules **actifs** sont visibles par tous (sans connexion)
- Pour chaque module, si l'utilisateur **n'est pas connecté** :
  - Affichage d'un encart "🔒 Contenu réservé aux membres"
  - Boutons **Connexion** et **S'inscrire** intégrés dans la carte
  - Pas de redirection abrupte — le message est contextuel
- Si l'utilisateur **est connecté** : bouton "Voir les cours →" direct

---

### 5. Rôle Admin — contrôle global

| Fonctionnalité              | Admin | Enseignant |
|-----------------------------|-------|------------|
| Voir tous les utilisateurs  | ✅    | ❌         |
| Valider enseignants         | ✅    | ❌         |
| Suspendre / Activer comptes | ✅    | ❌         |
| Supprimer utilisateurs      | ✅    | ❌         |
| CRUD Catégories             | ✅    | ❌         |
| CRUD Modules                | ✅    | ✅         |
| CRUD Cours                  | ✅    | ✅         |
| Upload fichiers (MinIO)     | ✅    | ✅         |
| Vue hiérarchique            | ✅    | ❌         |

---

## 🔄 Flux MinIO

### Upload (Enseignant / Admin)
1. Créer un cours via le dashboard → modal
2. Sélectionner un fichier (PDF ou vidéo MP4/WEBM)
3. Angular appelle `POST /api/cours/{id}/upload` avec `multipart/form-data`
4. Spring Boot valide le type → upload dans MinIO → sauvegarde l'`objectKey` en BDD

### Lecture (Apprenant)
1. Cliquer "Voir le cours" → route `/cours/{id}`
2. `CoursDetailComponent` charge le cours
3. Au clic "Accéder au contenu" → `GET /api/cours/{id}/presigned-url`
4. Spring Boot génère une URL pré-signée (15 min)
5. Angular :
   - **PDF** → `<iframe>` avec l'URL pré-signée
   - **Vidéo** → `<video>` HTML5

---

## 📦 Fichiers à intégrer (Spring Boot)

| Fichier source                              | Destination                                              | Action    |
|---------------------------------------------|----------------------------------------------------------|-----------|
| `spring/MinioConfig/MinioConfig.java`       | `src/main/java/.../MinioConfig/MinioConfig.java`         | Remplacer |
| `spring/Services/Minio/MinioService.java`   | `src/main/java/.../Services/Minio/MinioService.java`     | Remplacer |
| `spring/Controllers/CoursController.java`   | `src/main/java/.../Controllers/CoursController.java`     | Remplacer |
| `spring/application.properties`            | `src/main/resources/application.properties`              | Remplacer |

---

## ⚠️ Points d'attention

### CORS MinIO
Configurer via la console MinIO (Configuration > API > CORS) ou :
```bash
mc config host add local http://localhost:9002 minioadmin REMOVED_PASSWORD
```

### URL pré-signée dans Docker
Ajouter dans `application.properties` :
```properties
minio.public-url=http://localhost:9002
```
Et dans `MinioService.generatePresignedUrl()` :
```java
return url.replace(minioUrl, minioPublicUrl);
```

### Sécurité
- Bucket `cours` privé (pas d'accès public)
- URLs pré-signées : expiration 15 min
- Accès aux URLs uniquement pour les utilisateurs authentifiés (JWT)

---

## 🛠️ Développement local (sans Docker)

```bash
cd 9raiti
npm install
npm start        # http://localhost:4200  (proxy → localhost:9000)
```

Le fichier `proxy.conf.json` redirige `/api/**` vers le gateway.
