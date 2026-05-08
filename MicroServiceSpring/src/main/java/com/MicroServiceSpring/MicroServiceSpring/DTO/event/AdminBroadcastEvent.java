package com.MicroServiceSpring.MicroServiceSpring.DTO.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminBroadcastEvent {
    private String title;
    private String message;
    private String type;   // INFO | MAINTENANCE | ALERTE | MISE_A_JOUR
    private String cible;  // TOUS | APPRENANTS | ENSEIGNANTS
}
