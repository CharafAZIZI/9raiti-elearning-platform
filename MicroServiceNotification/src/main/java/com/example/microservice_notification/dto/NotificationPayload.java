package com.example.microservice_notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPayload {
    private String id;
    private String type;      // COURS_CREE, INTERACTION_LIKE, INFO, MAINTENANCE, etc.
    private String message;
    private String timestamp;
    private boolean lue;

    public static NotificationPayload of(String type, String message) {
        return NotificationPayload.builder()
                .id(UUID.randomUUID().toString())
                .type(type)
                .message(message)
                .timestamp(LocalDateTime.now().toString())
                .lue(false)
                .build();
    }
}
