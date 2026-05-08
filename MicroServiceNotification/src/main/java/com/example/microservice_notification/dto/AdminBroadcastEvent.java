package com.example.microservice_notification.dto;

import lombok.Data;

@Data
public class AdminBroadcastEvent {
    private String title;
    private String message;
    private String type;   // INFO | MAINTENANCE | ALERTE | MISE_A_JOUR
    private String cible;  // TOUS | APPRENANTS | ENSEIGNANTS
}
