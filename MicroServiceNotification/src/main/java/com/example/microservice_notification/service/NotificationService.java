package com.example.microservice_notification.service;

import com.example.microservice_notification.Entity.Notification;
import com.example.microservice_notification.Repository.NotificationRepository;
import com.example.microservice_notification.dto.*;
import com.example.microservice_notification.sse.SseEmitterManager;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService implements INotificationService {

    private final NotificationRepository repository;
    private final ObjectMapper           objectMapper;
    private final SseEmitterManager      sseManager;

    // ── Consommateur Kafka : nouveau cours ─────────────────────────────────────

    @Override
    public void handleCourseContent(String message) {
        try {
            CourseContentEvent event = objectMapper.readValue(message, CourseContentEvent.class);
            List<Long> studentIds = event.getStudentIds();
            if (studentIds == null || studentIds.isEmpty()) {
                log.warn("CourseContentEvent sans studentIds pour le cours {}", event.getCourseId());
                return;
            }
            String msg = event.getMessage() != null ? event.getMessage()
                    : "Un nouveau cours a été ajouté : " + event.getTitle();

            for (Long studentId : studentIds) {
                // Persister
                save(studentId, "Nouveau cours", msg, "COURS_CREE");
                // SSE temps réel
                sseManager.sendToUser(studentId,
                        NotificationPayload.of("COURS_CREE", msg));
            }
            log.info("[Kafka] COURSE_CONTENT → {} apprenants notifiés", studentIds.size());
        } catch (Exception e) {
            log.error("[Kafka] Erreur handleCourseContent : {}", e.getMessage(), e);
        }
    }

    // ── Consommateur Kafka : broadcast admin ───────────────────────────────────

    @Override
    public void handleAdminMessage(String message) {
        try {
            AdminBroadcastEvent event = objectMapper.readValue(message, AdminBroadcastEvent.class);
            String type  = event.getType()  != null ? event.getType()  : "INFO";
            String cible = event.getCible() != null ? event.getCible() : "TOUS";
            String msg   = event.getMessage();
            String title = event.getTitle() != null ? event.getTitle() : "Annonce";

            NotificationPayload payload = NotificationPayload.of(type, msg);

            // Persister + SSE selon la cible
            if ("TOUS".equals(cible)) {
                save(null, title, msg, type, "TOUS");
                sseManager.sendToAll(payload);
                log.info("[Kafka] ADMIN_BROADCAST → TOUS");
            } else if ("APPRENANTS".equals(cible)) {
                save(null, title, msg, type, "APPRENANTS");
                sseManager.sendToRole("APPRENANT", payload);
                log.info("[Kafka] ADMIN_BROADCAST → APPRENANTS uniquement");
            } else if ("ENSEIGNANTS".equals(cible)) {
                save(null, title, msg, type, "ENSEIGNANTS");
                sseManager.sendToRole("ENSEIGNANT", payload);
                log.info("[Kafka] ADMIN_BROADCAST → ENSEIGNANTS uniquement");
            } else {
                save(null, title, msg, type, "TOUS");
                sseManager.sendToAll(payload);
            }
            log.info("[Kafka] ADMIN_BROADCAST → cible={}, type={}", cible, type);
        } catch (Exception e) {
            log.error("[Kafka] Erreur handleAdminMessage : {}", e.getMessage(), e);
        }
    }

    // ── Consommateur Kafka : interactions cours ────────────────────────────────

    @Override
    public void handleInteraction(String message) {
        try {
            CourseInteractionEvent event = objectMapper.readValue(message, CourseInteractionEvent.class);
            Long teacherId = event.getTeacherId();
            String msg = event.getMessage() != null ? event.getMessage()
                    : "Un apprenant a effectué une action (" + event.getType() + ") sur votre cours.";

            String notifType = switch (event.getType() != null ? event.getType() : "") {
                case "LIKE"        -> "INTERACTION_LIKE";
                case "COMMENTAIRE" -> "INTERACTION_COMMENTAIRE";
                case "NOTE"        -> "INTERACTION_NOTE";
                default            -> "INFO";
            };

            save(teacherId, "Interaction cours", msg, notifType);
            sseManager.sendToUser(teacherId, NotificationPayload.of(notifType, msg));

            log.info("[Kafka] INTERACTION {} → enseignant {}", notifType, teacherId);
        } catch (Exception e) {
            log.error("[Kafka] Erreur handleInteraction : {}", e.getMessage(), e);
        }
    }

    /**
     * Charge toutes les notifications non lues pour un utilisateur donné.
     * Méthode @Transactional(readOnly=true) : la connexion DB est libérée
     * dès que la méthode retourne — le thread SSE ne tient jamais de connexion.
     */
    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<NotificationPayload> getPendingNotifications(Long userId, String role) {
        // Notifications personnelles non lues
        List<Notification> personal = repository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().filter(n -> !n.isRead()).toList();

        // Broadcasts TOUS
        List<Notification> tous = repository.findByUserIdIsNullAndCibleOrderByCreatedAtDesc("TOUS")
                .stream().filter(n -> !n.isRead()).toList();

        // Broadcasts ciblés par rôle
        List<Notification> roleNotifs = java.util.Collections.emptyList();
        if ("APPRENANT".equals(role)) {
            roleNotifs = repository.findByUserIdIsNullAndCibleOrderByCreatedAtDesc("APPRENANTS")
                    .stream().filter(n -> !n.isRead()).toList();
        } else if ("ENSEIGNANT".equals(role)) {
            roleNotifs = repository.findByUserIdIsNullAndCibleOrderByCreatedAtDesc("ENSEIGNANTS")
                    .stream().filter(n -> !n.isRead()).toList();
        }

        return java.util.stream.Stream.concat(
                        java.util.stream.Stream.concat(personal.stream(), tous.stream()),
                        roleNotifs.stream()
                )
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(n -> NotificationPayload.of(n.getType(), n.getMessage()))
                .toList();
    }

    // ── Utilitaires ────────────────────────────────────────────────────────────

    private void save(Long userId, String title, String message, String type, String cible) {
        repository.save(Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .cible(cible)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build());
    }

    // Surcharge pour les notifications ciblées userId (pas de cible)
    private void save(Long userId, String title, String message, String type) {
        save(userId, title, message, type, null);
    }

    // ── Suppression ────────────────────────────────────────────────────────────

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteAllByUserId(Long userId) {
        repository.deleteByUserId(userId);
    }
}