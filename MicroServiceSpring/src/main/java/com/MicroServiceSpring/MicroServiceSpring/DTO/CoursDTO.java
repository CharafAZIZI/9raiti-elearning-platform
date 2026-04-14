package com.MicroServiceSpring.MicroServiceSpring.DTO;

import com.MicroServiceSpring.MicroServiceSpring.Models.Cours.Niveau;
import com.MicroServiceSpring.MicroServiceSpring.Models.Cours.StatutCours;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CoursDTO {

    private Long idCours;

    @NotBlank(message = "Le titre est obligatoire")
    private String titre;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    @NotNull(message = "Le niveau est obligatoire")
    private Niveau niveau;

    // CORRECTION : statut manquait dans le DTO d'origine → impossible de créer/filtrer par statut
    private StatutCours statut;

    private LocalDateTime dateCreation;

    private Integer nombreInscrits;

    private Integer dureeMinutes;

    private String filePath;

    @NotNull(message = "Le module est obligatoire")
    private Long moduleId;
}
