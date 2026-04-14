package com.MicroServiceSpring.MicroServiceSpring.DTO;

import com.MicroServiceSpring.MicroServiceSpring.Models.StatutFeedback;
import com.MicroServiceSpring.MicroServiceSpring.Models.TypeAvis;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FeedbackDTO {

    private Long idFeedback;

    @Email(message = "Email invalide")
    @NotBlank(message = "L'email est obligatoire")
    private String email;

    @NotNull(message = "Le type d'avis est obligatoire")
    private TypeAvis typeAvis;

    @NotBlank(message = "Le message est obligatoire")
    @Size(min = 10, max = 2000, message = "Le message doit contenir entre 10 et 2000 caractères")
    private String message;

    // Optionnel : uniquement pour AVIS_COURS
    private Long coursId;

    // Rempli automatiquement côté serveur depuis le JWT (ne pas faire confiance au client)
    private String roleAuteur;

    // Rempli côté serveur
    private StatutFeedback statut;

    // Réponse admin (lecture seule pour le client)
    private String reponseAdmin;

    private LocalDateTime dateCreation;
    private LocalDateTime dateTraitement;
}
