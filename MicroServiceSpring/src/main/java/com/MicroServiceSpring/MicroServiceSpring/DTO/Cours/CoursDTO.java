package com.MicroServiceSpring.MicroServiceSpring.DTO.Cours;

import com.MicroServiceSpring.MicroServiceSpring.Models.Cours.Niveau;
import com.MicroServiceSpring.MicroServiceSpring.Models.Cours.StatutCours;
import com.fasterxml.jackson.annotation.JsonFormat;
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

    private StatutCours statut;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateCreation;

    private Integer dureeMinutes;

    private String filePath;

    @NotNull(message = "Le module est obligatoire")
    private Long moduleId;

    /** ID de l'enseignant propriétaire — renvoyé au frontend pour filtrer les actions CRUD */
    private Long enseignantId;
}
