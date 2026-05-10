package com.example.microservice_notification.Sse;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Slf4j
@Component
public class SseEmitterManager {

    // userId → ensemble d'émetteurs (multi-onglets possible)
    private final Map<Long, Set<SseEmitter>> emitters = new ConcurrentHashMap<>();

    // userId → rôle (APPRENANT, ENSEIGNANT, ADMIN...)
    private final Map<Long, String> userRoles = new ConcurrentHashMap<>();

    /** Enregistrer un émetteur pour un utilisateur avec son rôle */
    public SseEmitter register(Long userId, String role) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        emitters.computeIfAbsent(userId, k -> new CopyOnWriteArraySet<>()).add(emitter);
        if (role != null) userRoles.put(userId, role.toUpperCase());

        Runnable cleanup = () -> {
            Set<SseEmitter> set = emitters.get(userId);
            if (set != null) {
                set.remove(emitter);
                if (set.isEmpty()) {
                    emitters.remove(userId);
                    userRoles.remove(userId);
                }
            }
        };
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        log.info("[SSE] Utilisateur {} ({}) connecté ({} émetteurs actifs)",
                userId, role, emitters.getOrDefault(userId, Set.of()).size());
        return emitter;
    }

    /** Enregistrer sans rôle (compatibilité) */
    public SseEmitter register(Long userId) {
        return register(userId, null);
    }

    /** Envoyer un event à un utilisateur spécifique */
    public void sendToUser(Long userId, Object data) {
        Set<SseEmitter> set = emitters.get(userId);
        if (set == null || set.isEmpty()) return;

        Set<SseEmitter> dead = new CopyOnWriteArraySet<>();
        for (SseEmitter emitter : set) {
            try {
                emitter.send(SseEmitter.event().name("notification").data(data));
            } catch (IOException e) {
                dead.add(emitter);
            }
        }
        set.removeAll(dead);
    }

    /** Envoyer à tous les utilisateurs connectés */
    public void sendToAll(Object data) {
        emitters.keySet().forEach(userId -> sendToUser(userId, data));
    }

    /** Envoyer uniquement aux utilisateurs d'un rôle donné (APPRENANT ou ENSEIGNANT) */
    public void sendToRole(String role, Object data) {
        String roleUp = role.toUpperCase();
        emitters.keySet().stream()
                .filter(uid -> roleUp.equals(userRoles.get(uid)))
                .forEach(uid -> sendToUser(uid, data));
        log.info("[SSE] sendToRole({}) → {} connectés filtrés",
                roleUp, emitters.keySet().stream()
                        .filter(uid -> roleUp.equals(userRoles.get(uid))).count());
    }

    /** Envoyer à un ensemble d'userIds */
    public void sendToRole(Set<Long> userIds, Object data) {
        userIds.forEach(uid -> sendToUser(uid, data));
    }

    /** IDs de tous les utilisateurs actuellement connectés */
    public Set<Long> getConnectedUserIds() {
        return emitters.keySet();
    }
}