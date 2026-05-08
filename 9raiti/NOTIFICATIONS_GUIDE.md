# 9raiti - Notifications & Interactions - Guide d'intégration

## Ce qui a été ajouté (Frontend Angular)

### Nouveaux fichiers créés

```
src/app/
├── models/
│   ├── notification.model.ts       ← Types des notifications
│   └── interaction.model.ts        ← Types likes/notes/commentaires
├── core/services/
│   ├── notification.service.ts     ← SSE (Server-Sent Events) temps réel
│   └── interaction.service.ts      ← API likes, notes, commentaires
├── shared/components/
│   └── notification-bell/
│       ├── notification-bell.component.ts   ← Cloche avec badge + panel + toast
│       ├── notification-bell.component.html
│       └── notification-bell.component.css
└── components/
    └── cours-interaction/
        ├── cours-interaction.component.ts   ← Likes ❤️ + Étoiles ⭐ + Commentaires 💬
        ├── cours-interaction.component.html
        └── cours-interaction.component.css
```

### Fichiers modifiés

- `navbar.component.ts` — Importe NotificationService + NotificationBellComponent, connect SSE au login
- `navbar.component.html` — Ajoute `<app-notification-bell>` entre le divider et le user chip

## Intégration dans les dashboards

### Ajouter la cloche (déjà dans la Navbar, donc automatique)
La navbar intègre automatiquement la cloche pour les 3 rôles.

### Ajouter les interactions sur les cours

Dans `dashboard-apprenant.component.html`, à l'intérieur de chaque card cours :
```html
<app-cours-interaction [coursId]="cours.idCours!" userRole="apprenant"></app-cours-interaction>
```

Dans `dashboard-enseignant.component.html` :
```html
<app-cours-interaction [coursId]="cours.idCours!" userRole="enseignant"></app-cours-interaction>
```

Dans `dashboard-admin.component.html` :
```html
<app-cours-interaction [coursId]="cours.idCours!" userRole="admin"></app-cours-interaction>
```

N'oubliez pas d'importer `CoursInteractionComponent` dans chaque dashboard.

---

## Backend requis (Spring Boot)

### 1. Endpoint SSE Notifications (service .NET ou Spring)

```csharp
// .NET — NotificationsController.cs
[HttpGet("stream")]
public async Task Stream([FromQuery] string token, CancellationToken ct) {
    Response.Headers["Content-Type"] = "text/event-stream";
    Response.Headers["Cache-Control"] = "no-cache";
    Response.Headers["X-Accel-Buffering"] = "no";

    // Valider le JWT depuis le token query param
    var userId = ValidateToken(token);
    if (userId == null) { Response.StatusCode = 401; return; }

    // S'abonner au canal Kafka ou à un channel mémoire
    await foreach (var notif in GetNotificationsStream(userId, ct)) {
        var json = JsonSerializer.Serialize(notif);
        await Response.WriteAsync($"event: notification\ndata: {json}\n\n", ct);
        await Response.Body.FlushAsync(ct);
    }
}
```

### 2. Endpoints Interactions (Spring Boot)

```java
@RestController
@RequestMapping("/api/interactions/cours/{coursId}")
public class InteractionController {

    // GET /api/interactions/cours/{coursId}
    @GetMapping
    public ResponseEntity<InteractionCoursDTO> getInteractions(@PathVariable Long coursId) { ... }

    // POST /api/interactions/cours/{coursId}/like
    @PostMapping("/like")
    public ResponseEntity<LikeDTO> toggleLike(@PathVariable Long coursId, Authentication auth) { ... }

    // POST /api/interactions/cours/{coursId}/note
    @PostMapping("/note")
    public ResponseEntity<NoteDTO> noter(@PathVariable Long coursId, @RequestBody NoteRequest req, Authentication auth) { ... }

    // GET /api/interactions/cours/{coursId}/commentaires
    @GetMapping("/commentaires")
    public ResponseEntity<List<CommentaireDTO>> getCommentaires(@PathVariable Long coursId) { ... }

    // POST /api/interactions/cours/{coursId}/commentaires
    @PostMapping("/commentaires")
    public ResponseEntity<CommentaireDTO> ajouter(@PathVariable Long coursId, @RequestBody CommentaireDTO dto, Authentication auth) { ... }

    // DELETE /api/interactions/cours/{coursId}/commentaires/{id}
    @DeleteMapping("/commentaires/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long coursId, @PathVariable Long id, Authentication auth) { ... }
}
```

### 3. Kafka → Notifications

Lors des opérations dans Spring Boot (cours créé, inscription, etc.), publier dans un topic Kafka :
```java
@Service
public class NotificationKafkaProducer {
    @Autowired KafkaTemplate<String, NotificationEvent> kafkaTemplate;

    public void notifier(String userId, String type, String message) {
        var event = new NotificationEvent(UUID.randomUUID().toString(), type, message, Instant.now());
        kafkaTemplate.send("notifications-" + userId, event);
    }
}
```

Le service .NET écoute ce topic et envoie via SSE.

---

## API Gateway (ocelot.json) — Ajouté

```
/api/interactions/**  → spring-service:8080
/api/notifications/stream → dotnet-service:5000 (SSE)
/api/notifications/**     → dotnet-service:5000
```

---

## Types de notifications supportés

| Type | Description |
|------|-------------|
| `COURS_CREE` | Un cours a été créé |
| `COURS_PUBLIE` | Un cours a été publié |
| `COURS_ARCHIVE` | Un cours a été archivé |
| `COURS_SUPPRIME` | Un cours a été supprimé |
| `MODULE_CREE` | Un module a été créé |
| `INSCRIPTION_CREE` | Nouvelle inscription |
| `USER_VALIDE` | Compte utilisateur validé |
| `USER_CREE` | Nouvel utilisateur enregistré |
| `INTERACTION_LIKE` | Quelqu'un a aimé un cours |
| `INTERACTION_COMMENTAIRE` | Nouveau commentaire |
| `INTERACTION_NOTE` | Nouveau avis/note |
