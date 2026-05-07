# 🧪 GUIDE DE TEST - Génération de Quiz par IA

## 📋 PRÉ-REQUIS

✅ Docker Compose UP avec tous les services
✅ Ollama avec le modèle Mistral téléchargé
✅ API Gateway fonctionnel avec la route `/api/quiz-ai`
✅ Quiz AI Service démarré sur le port 8081
✅ Frontend Angular déployé

---

## 🔍 ÉTAPE 1 : Vérifier que tous les services sont UP

```bash
# Voir l'état de tous les conteneurs
docker-compose ps

# Vous devriez voir :
# - postgres          (Healthy)
# - ollama            (Started)
# - quiz-ai-service   (Started ou Healthy)
# - api-gateway       (Started)
# - angular           (Started)
```

**Si `api-gateway` est en `Exited` :**

```bash
# Voir les logs
docker logs api-gateway

# Si erreur JSON dans ocelot.json :
# 1. Validez votre ocelot.json sur https://jsonlint.com
# 2. Corrigez les virgules manquantes
# 3. Redémarrez : docker-compose restart api-gateway
```

---

## 🔍 ÉTAPE 2 : Vérifier qu'Ollama a le modèle Mistral

```bash
# Vérifier les modèles installés
docker exec -it ollama ollama list

# Vous devriez voir :
# NAME              ID              SIZE      MODIFIED
# mistral:latest    xxx             4.4 GB    X minutes ago
```

**Si Mistral n'est pas là :**

```bash
# Télécharger Mistral (5-10 minutes)
docker exec -it ollama ollama pull mistral

# Attendre la fin du téléchargement
```

---

## 🔍 ÉTAPE 3 : Tester le Quiz AI Service directement

```bash
# Health check
curl http://localhost:8081/api/quiz-ai/health

# Réponse attendue :
{
  "status": "UP",
  "service": "quiz-ai-service",
  "timestamp": 1746453000000
}
```

**Si erreur "Connection refused" :**

```bash
# Voir les logs du service
docker logs quiz-ai-service

# Vérifier qu'il écoute sur le port 8081
docker exec -it quiz-ai-service netstat -tuln | grep 8081
```

---

## 🔍 ÉTAPE 4 : Tester la route via l'API Gateway

```bash
# Via l'API Gateway
curl http://localhost:9000/api/quiz-ai/health

# Réponse attendue : même que ci-dessus
```

**Si erreur 404 :**
- La route `/api/quiz-ai` n'est pas dans `ocelot.json`
- Ajoutez-la et redémarrez l'API Gateway

**Si erreur 503 (Service Unavailable) :**
- Le Quiz AI Service n'est pas accessible
- Vérifiez qu'il tourne : `docker ps | grep quiz-ai`

---

## 🔍 ÉTAPE 5 : Tester le Frontend Angular

### 5.1 Ouvrir l'application

```
http://localhost:4200
```

### 5.2 Se connecter en tant qu'enseignant

**Identifiants de test (créez-les si nécessaire) :**
- Email : `enseignant@test.com`
- Mot de passe : votre mot de passe

### 5.3 Aller dans "Mes Quiz"

Cliquez sur le menu **"Mes Quiz"** dans la sidebar.

### 5.4 Ouvrir la console du navigateur

**Chrome/Edge/Firefox :**
- Appuyez sur **F12**
- Allez dans l'onglet **Console**

### 5.5 Cliquer sur "🤖 Générer par IA"

Regardez dans la console :

**✅ SI VOUS VOYEZ :**
```
🔥 BOUTON CLIQUÉ - Ouverture modal IA
✅ showGenerationIAModal = true
```
→ Le code fonctionne ! Le modal devrait s'ouvrir.

**❌ SI RIEN N'APPARAÎT :**
→ Le bouton n'appelle pas la méthode. Problème de binding Angular.

**❌ SI VOUS VOYEZ UNE ERREUR :**
```
ERROR TypeError: Cannot read property 'reset' of undefined
```
→ `iaForm` n'est pas initialisé. `buildIAForm()` n'a pas été appelée.

---

## 🔍 ÉTAPE 6 : Déboguer si le modal ne s'affiche pas

### 6.1 Vérifier dans les DevTools

**F12 → Elements → Ctrl+F → Rechercher : `showGenerationIAModal`**

Vous devriez trouver :
```html
<div class="overlay" style="...">
  <div class="modal" style="...">
    ...
  </div>
</div>
```

**Si l'élément est là mais invisible :**
→ Problème CSS (z-index, opacity, display)

### 6.2 Forcer l'affichage dans la console

Dans la console du navigateur, tapez :

```javascript
// Récupérer le component
let comp = angular.getComponent(document.querySelector('app-dashboard-enseignant'));

// Forcer l'ouverture
comp.showGenerationIAModal = true;
comp.cdr.detectChanges();
```

Si le modal apparaît → Le problème est dans le binding du bouton.

---

## 🧪 ÉTAPE 7 : Tester la génération de quiz COMPLÈTE

### 7.1 Préparer un PDF de test

Créez un fichier PDF simple avec du texte, par exemple :

```
Cours de Mathématiques - Les Fractions

Une fraction est un nombre qui représente une partie d'un tout.
Elle est composée d'un numérateur et d'un dénominateur.

Exemple : 3/4 signifie 3 parts sur 4.

Les fractions peuvent être simplifiées en divisant le numérateur
et le dénominateur par leur PGCD.
```

Enregistrez ce texte en PDF (utilisez Word/LibreOffice).

### 7.2 Remplir le formulaire

1. **Cliquez sur "🤖 Générer par IA"**
2. **Uploadez votre PDF** de test
3. **Sélectionnez un cours** dans la liste
4. **Nombre de questions :** 3 (pour tester rapidement)
5. **Difficulté :** Moyen
6. **Type :** QCM
7. **Cliquez sur "🤖 Générer le Quiz"**

### 7.3 Observer le processus

**Dans la console du navigateur (F12), vous devriez voir :**

```
POST http://localhost:9000/api/quiz-ai/generate
Status: 200 OK
```

**Durée attendue :** 15-60 secondes (première fois peut être plus long).

**Si erreur 401 (Unauthorized) :**
→ Votre JWT est expiré. Reconnectez-vous.

**Si erreur 500 :**
→ Regardez les logs du Quiz AI Service :

```bash
docker logs quiz-ai-service
```

Erreurs possibles :
- `Cannot connect to Ollama` → Ollama n'est pas accessible
- `PDF extraction failed` → Le PDF n'est pas valide ou vide
- `JSON parse error` → Ollama a mal formaté la réponse

### 7.4 Vérifier le résultat

**Si succès :**
- ✅ Un message de succès apparaît : "Quiz généré avec succès ! 3 questions créées par l'IA."
- ✅ Le modal se ferme
- ✅ Le nouveau quiz apparaît dans la liste "Mes Quiz"

**Cliquez sur le quiz généré** pour voir les questions créées par l'IA !

---

## 🐛 TROUBLESHOOTING COMPLET

### Problème 1 : Le bouton ne réagit pas

**Symptôme :** Rien ne se passe, pas de log dans la console.

**Solution :**
```bash
# Reconstruire le frontend
docker-compose restart angular

# Vider le cache du navigateur
Ctrl + Shift + R (ou Cmd + Shift + R sur Mac)
```

---

### Problème 2 : Erreur "iaForm is undefined"

**Symptôme :** 
```
TypeError: Cannot read property 'reset' of undefined
```

**Solution :**

Vérifiez dans `dashboard-enseignant.component.ts` :

```typescript
ngOnInit(): void {
  // ... 
  this.buildForms();
  this.buildIAForm(); // ← CETTE LIGNE DOIT ÊTRE PRÉSENTE
  this.loadAll();
}
```

---

### Problème 3 : Erreur "Cannot connect to Ollama"

**Symptôme :**
```json
{
  "statut": "GENERATION_ERROR",
  "message": "Impossible de contacter Ollama"
}
```

**Solution :**

```bash
# Vérifier qu'Ollama tourne
docker ps | grep ollama

# Tester la connexion depuis le Quiz AI Service
docker exec -it quiz-ai-service curl http://ollama:11434/api/tags

# Si erreur → Vérifier le réseau Docker
docker network inspect elearning-net
```

---

### Problème 4 : Génération très lente (>2 minutes)

**Symptôme :** Le spinner tourne indéfiniment.

**Causes possibles :**
1. **Première génération** → Ollama charge le modèle (normal)
2. **PDF trop gros** → Réduisez la taille ou le nombre de pages
3. **Trop de questions** → Réduisez à 3-5 pour tester

**Solution :**

```bash
# Voir les logs en temps réel
docker logs -f quiz-ai-service
docker logs -f ollama

# Si Ollama est bloqué, redémarrer
docker restart ollama
```

---

### Problème 5 : Les questions générées sont de mauvaise qualité

**Symptôme :** Questions hors sujet, réponses incorrectes.

**Causes :**
- PDF avec peu de texte ou mal structuré
- Mistral n'a pas assez de contexte

**Solution :**
- Utilisez un PDF avec au moins 500 mots de texte
- Structurez le contenu avec des titres/sous-titres
- Testez avec un cours bien rédigé

---

## ✅ CHECKLIST FINALE

Avant de dire "ça ne marche pas", vérifiez :

- [ ] `docker-compose ps` → Tous les services Started/Healthy
- [ ] `docker exec -it ollama ollama list` → Mistral est présent
- [ ] `curl http://localhost:8081/api/quiz-ai/health` → Répond OK
- [ ] `curl http://localhost:9000/api/quiz-ai/health` → Répond OK
- [ ] Connexion en tant qu'enseignant réussie
- [ ] Console du navigateur ouverte (F12)
- [ ] Clic sur "Générer par IA" → Log "🔥 BOUTON CLIQUÉ" visible
- [ ] Modal s'affiche (ou erreur visible dans console)
- [ ] PDF de test prêt (< 5 MB, avec du texte)
- [ ] Cours sélectionné dans le dropdown
- [ ] Formulaire valide avant de submit

---

## 📊 RÉSULTAT ATTENDU

**Après 15-60 secondes, vous devriez avoir :**

1. ✅ Un quiz créé dans la base de données
2. ✅ 3-10 questions générées automatiquement par l'IA
3. ✅ Chaque question a 4 réponses (QCM) ou 2 réponses (Vrai/Faux)
4. ✅ Une seule bonne réponse par question
5. ✅ Le quiz apparaît dans "Mes Quiz"

**Exemple de quiz généré :**

```
Titre : Quiz généré automatiquement - 2026-05-05
Cours : Introduction aux Mathématiques

Question 1 : Qu'est-ce qu'une fraction ?
- ✅ Un nombre représentant une partie d'un tout
- ❌ Un nombre entier
- ❌ Un nombre décimal
- ❌ Un nombre négatif

Question 2 : Une fraction est composée de :
- ✅ Un numérateur et un dénominateur
- ❌ Deux numérateurs
- ❌ Trois parties
- ❌ Un seul nombre

Question 3 : Que signifie 3/4 ?
- ✅ 3 parts sur 4
- ❌ 3 fois 4
- ❌ 4 divisé par 3
- ❌ 3 plus 4
```

---

## 🎉 SI TOUT FONCTIONNE

**Félicitations ! Votre système de génération de quiz par IA est opérationnel !**

Vous pouvez maintenant :
- Générer des quiz depuis n'importe quel PDF de cours
- Ajuster le niveau de difficulté
- Choisir le type de questions (QCM, Vrai/Faux, Mixte)
- Modifier les questions générées avant publication
- Les apprenants peuvent passer les quiz normalement

---

## 📞 AIDE SUPPLÉMENTAIRE

Si après avoir suivi TOUTES ces étapes, ça ne fonctionne toujours pas :

1. **Vérifiez les logs :**
   ```bash
   docker logs api-gateway > api-gateway.log
   docker logs quiz-ai-service > quiz-ai.log
   docker logs ollama > ollama.log
   ```

2. **Testez avec curl :**
   ```bash
   curl -X POST http://localhost:8081/api/quiz-ai/generate \
     -H "Authorization: Bearer VOTRE_JWT_TOKEN" \
     -F "file=@test.pdf" \
     -F "coursId=1" \
     -F "nombreQuestions=3" \
     -F "difficulte=MOYEN" \
     -F "typeQuestions=QCM"
   ```

3. **Regardez la console du navigateur** pour les erreurs réseau

---

Bonne chance ! 🚀
