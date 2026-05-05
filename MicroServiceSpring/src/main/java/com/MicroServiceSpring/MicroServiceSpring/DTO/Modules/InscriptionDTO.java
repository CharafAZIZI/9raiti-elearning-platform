package com.MicroServiceSpring.MicroServiceSpring.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO renvoyé au frontend représentant une inscription apprenant → module.
 */
@Data
public class InscriptionDTO {

    private Long id;

    private Long apprenantId;

    /** Détail complet du module inscrit */
    private ModuleDTO module;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateInscription;
}
