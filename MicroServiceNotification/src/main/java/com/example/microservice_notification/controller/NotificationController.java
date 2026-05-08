package com.example.microservice_notification.controller;

import com.example.microservice_notification.Entity.Notification;
import com.example.microservice_notification.Repository.NotificationRepository;
import com.example.microservice_notification.dto.NotificationPayload;
import com.example.microservice_notification.service.INotificationService;
import com.example.microservice_notification.sse.SseEmitterManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

/**
 * GET  /api/notifications/stream?token=...  → SSE (temps réel)
 * GET  /api/notifications/me                → historique de l'utilisateur
 * PUT  /api/notifications/{id}/read         → marquer comme lu
 */
@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final SseEmitterManager      sseManager;
    private final NotificationRepository repository;
    private final JwtTokenExtractor      jwtExtractor;
    private final INotificationService   notificationService;

    /**
     * Connexion SSE — le token JWT est passé en query param car
     * EventSource ne supporte pas les headers Authorization.
     *
     * IMPORTANT : toutes les requêtes DB sont faites AVANT l'enregistrement
     * de l'émetteur SSE pour libérer la connexion HikariCP immédiatement.
     * Le thread SSE lui-même ne doit JAMAIS tenir une connexion DB ouverte.
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestParam String token) {
        Long userId = jwtExtractor.extractUserId(token);
        if (userId == null) {
            log.warn("[SSE] Token invalide, connexion refusée.");
            SseEmitter rejected = new SseEmitter();
            rejected.completeWithError(new SecurityException("Token invalide"));
            return rejected;
        }
        String role = jwtExtractor.extractRole(token);
        log.info("[SSE] Connexion acceptée pour userId={} role={}", userId, role);

        // ── 1. Charger toutes les données DB maintenant (connexion libérée après) ──
        List<NotificationPayload> pending = notificationService.getPendingNotifications(userId, role);

        // ── 2. Enregistrer l'émetteur SSE (pas de DB ici) ──────────────────────────
        SseEmitter emitter = sseManager.register(userId, role);

        // ── 3. Envoyer les notifications non lues en rafale initiale ───────────────
        pending.forEach(p -> sseManager.sendToUser(userId, p));

        return emitter;
    }

    /** Historique des notifications de l'utilisateur (DB) */
    @GetMapping("/me")
    public ResponseEntity<List<Notification>> getMyNotifications(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtExtractor.extractUserIdFromHeader(authHeader);
        if (userId == null) return ResponseEntity.status(401).build();

        List<Notification> all = repository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Notification> broadcast = repository.findByUserIdIsNullOrderByCreatedAtDesc();
        List<Notification> combined = Stream.concat(all.stream(), broadcast.stream())
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();
        return ResponseEntity.ok(combined);
    }

    /** Marquer une notification comme lue */
    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(@PathVariable Long id) {
        return repository.findById(id).map(n -> {
            n.setRead(true);
            repository.save(n);
            return ResponseEntity.ok(Map.of("status", "read"));
        }).orElse(ResponseEntity.notFound().build());
    }
}