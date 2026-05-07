# 🚀 GUIDE DE TEST RAPIDE - Quiz IA

## ✅ ÉTAPE 1 : Vérifier les services Docker

```bash
docker-compose ps
```

**Attendu :**
- ✅ postgres : Healthy
- ✅ ollama : Started (pas de healthcheck)
- ✅ quiz-ai-service : Started
- ✅ api-gateway : Started
- ✅ angular : Started

**Si api-gateway est Exited :**
```bash
docker logs api-gateway
# Vérifiez l'erreur JSON dans ocelot.json
# Puis : docker-compose restart api-gateway
```

---

## ✅ ÉTAPE 2 : Vérifier Ollama et Mistral

```bash
# Liste des modèles
docker exec -it ollama ollama list

# Si Mistral n'est pas là, téléchargez-le (5-10 min)
docker exec -it ollama ollama pull mistral
```

---

## ✅ ÉTAPE 3 : Tester les API

```bash
# Quiz AI Service direct
curl http://localhost:8081/api/quiz-ai/health

# Via API Gateway
curl http://localhost:9000/api/quiz-ai/health
```

**Attendu :**
```json
{
  "status": "UP",
  "service": "quiz-ai-service",
  "timestamp": 1234567890
}
```

---

## ✅ ÉTAPE 4 : Tester le Frontend

1. **Ouvrez** : http://localhost:4200
2. **Connectez-vous** en tant qu'enseignant
3. **Allez dans** "Mes Quiz"
4. **Ouvrez F12** (Console du navigateur)
5. **Cliquez** sur "🤖 Générer par IA"

**Dans la console, vous devez voir :**
```
🔥 BOUTON CLIQUÉ - Ouverture modal IA
✅ showGenerationIAModal = true
```

**Le modal doit s'ouvrir avec un fond noir semi-transparent !**

---

## ✅ ÉTAPE 5 : Générer un quiz

### Préparez un PDF simple :

Créez un fichier texte, copiez ce contenu, convertissez en PDF :

```
COURS DE MATHÉMATIQUES

Les Fractions
=============

Une fraction représente une partie d'un tout.
Elle est composée d'un numérateur et d'un dénominateur.

Exemples :
- 1/2 = la moitié
- 3/4 = trois quarts
- 2/5 = deux cinquièmes

Simplification :
Pour simplifier, on divise par le PGCD.
Exemple : 6/8 = 3/4
```

### Testez la génération :

1. Uploadez votre PDF
2. Sélectionnez un cours
3. Nombre de questions : **3**
4. Difficulté : **Moyen**
5. Type : **QCM**
6. Cliquez "🤖 Générer le Quiz"
7. **Attendez 15-60 secondes**

**Résultat attendu :**
- ✅ Message : "Quiz généré avec succès ! 3 questions créées par l'IA."
- ✅ Le quiz apparaît dans "Mes Quiz"
- ✅ Cliquez dessus pour voir les questions

---

## 🐛 DÉPANNAGE RAPIDE

### Le modal ne s'ouvre pas

**Test dans la console (F12) :**
```javascript
document.querySelector('.overlay')
```

- **null** → Problème Angular (`*ngIf` ne fonctionne pas)
- **HTMLElement** → Problème CSS

**Forcer l'affichage :**
```javascript
let overlay = document.querySelector('.overlay');
overlay.style.display = 'flex';
overlay.style.zIndex = '999999';
```

---

### Erreur "Cannot connect to Ollama"

```bash
# Tester depuis quiz-ai-service
docker exec -it quiz-ai-service curl http://ollama:11434/api/tags

# Redémarrer Ollama si nécessaire
docker restart ollama
```

---

### Génération lente (>2 min)

**Normal la première fois** (chargement du modèle dans Ollama).

Voir les logs :
```bash
docker logs -f quiz-ai-service
docker logs -f ollama
```

---

### Questions de mauvaise qualité

**Causes :**
- PDF avec peu de texte
- Texte mal structuré

**Solution :**
- Minimum 500 mots
- Titres et sous-titres clairs
- Contenu pédagogique structuré

---

## 📊 RÉSULTAT FINAL

Après génération réussie, vous devriez avoir :

✅ Un quiz avec 3 questions
✅ Chaque question a 4 réponses (QCM)
✅ Une seule bonne réponse par question
✅ Questions pertinentes basées sur le PDF

**Exemple :**

```
Question 1 : Qu'est-ce qu'une fraction ?
✅ Un nombre représentant une partie d'un tout
❌ Un nombre entier
❌ Un nombre décimal
❌ Un pourcentage

Question 2 : Comment simplifie-t-on une fraction ?
✅ En divisant par le PGCD
❌ En multipliant par 2
❌ En additionnant les termes
❌ En soustrayant le dénominateur

Question 3 : Que représente 3/4 ?
✅ Trois quarts
❌ Trois fois quatre
❌ Quatre tiers
❌ Sept
```

---

## 🎉 SUCCÈS !

Si vous voyez vos questions générées, **félicitations** ! 

Le système fonctionne parfaitement ! 🚀

---

## ❓ AIDE

**Si après tous ces tests, ça ne marche toujours pas :**

1. Vérifiez **TOUS** les logs :
   ```bash
   docker logs api-gateway > api-gateway.log
   docker logs quiz-ai-service > quiz-ai.log
   docker logs ollama > ollama.log
   ```

2. Regardez la console du navigateur (F12 → Console)

3. Testez l'API manuellement avec Postman ou curl

**Commande curl complète :**
```bash
curl -X POST http://localhost:9000/api/quiz-ai/generate \
  -H "Authorization: Bearer VOTRE_JWT_TOKEN" \
  -F "file=@test.pdf" \
  -F "coursId=1" \
  -F "nombreQuestions=3" \
  -F "difficulte=MOYEN" \
  -F "typeQuestions=QCM"
```

Bonne chance ! 🎯
