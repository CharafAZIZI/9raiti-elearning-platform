package com.example.microservice_notification.service;

import com.example.microservice_notification.dto.NotificationPayload;
import java.util.List;

public interface INotificationService {
    void handleCourseContent(String message);
    void handleAdminMessage(String message);
    void handleInteraction(String message);

    /** Charge les notifications non lues pour un utilisateur (appelé à la connexion SSE) */
    List<NotificationPayload> getPendingNotifications(Long userId, String role);
}