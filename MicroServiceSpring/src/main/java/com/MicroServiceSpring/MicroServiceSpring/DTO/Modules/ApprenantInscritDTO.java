package com.MicroServiceSpring.MicroServiceSpring.DTO.Modules;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO représentant un apprenant inscrit à un module.
 * Renvoyé à l'enseignant pour lister ses apprenants.
 *
 * Note : les données de l'apprenant (nom, prénom, email) sont stockées
 * dans le microservice .NET. Ici on expose uniquement l'apprenantId
 * et la date d'inscription ; le frontend enrichit si nécessaire.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprenantInscritDTO {

    /** ID de l'inscription */
    private Long inscriptionId;

    /** ID de l'apprenant (claim NameIdentifier du JWT .NET) */
    private Long apprenantId;

    /** Résumé du module concerné */
    private Long   moduleId;
    private String moduleNom;
    private String moduleCode;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateInscription;
}
