package com.MicroServiceSpring.MicroServiceSpring.Controllers.Interaction;

import com.MicroServiceSpring.MicroServiceSpring.Services.Notifications.AdminNotificationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * POST /api/notifications/broadcast              → tous les utilisateurs
 * POST /api/notifications/broadcast/role/{role}  → par rôle (apprenant|enseignant)
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class BroadcastController {

    private final AdminNotificationService adminNotificationService;

    @PostMapping("/broadcast")
    public ResponseEntity<Map<String, String>> broadcastAll(
            @RequestBody BroadcastRequest req) {
        String cible = req.getCible() != null ? req.getCible() : "TOUS";
        adminNotificationService.sendBroadcast(
                req.getMessage(),
                req.getType() != null ? req.getType() : "INFO",
                cible
        );
        return ResponseEntity.ok(Map.of("status", "sent", "cible", cible));
    }

    @PostMapping("/broadcast/role/{role}")
    public ResponseEntity<Map<String, String>> broadcastByRole(
            @PathVariable String role,
            @RequestBody BroadcastRequest req) {
        String cible = role.equalsIgnoreCase("apprenant") ? "APPRENANTS" : "ENSEIGNANTS";
        adminNotificationService.sendBroadcast(
                req.getMessage(),
                req.getType() != null ? req.getType() : "INFO",
                cible
        );
        return ResponseEntity.ok(Map.of("status", "sent", "cible", cible));
    }

    @Data
    public static class BroadcastRequest {
        private String message;
        private String type;  // INFO | MAINTENANCE | ALERTE | MISE_A_JOUR
        private String cible; // TOUS | APPRENANTS | ENSEIGNANTS
    }
}