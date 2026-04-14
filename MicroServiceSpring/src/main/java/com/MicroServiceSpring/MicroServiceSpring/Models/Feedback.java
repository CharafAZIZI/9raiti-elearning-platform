package com.MicroServiceSpring.MicroServiceSpring.Models;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
@Entity
@Table(name = "feedbacks")
@Getter
@Setter
@NoArgsConstructor
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_feedback")
    private Long idFeedback;

    /**
     * Email de l'auteur.
     * - Utilisateur non connecté : saisi manuellement
     * - Utilisateur connecté : pré-rempli depuis le JWT
     */
    @Email(message = "Email invalide")
    @NotBlank(message = "L'email est obligatoire")
    @Column(nullable = false, length = 150)
    private String email;

    @NotNull(message = "Le type d'avis est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(name = "type_avis", nullable = false, length = 30)
    private TypeAvis typeAvis;

    @NotBlank(message = "Le message est obligatoire")
    @Size(min = 10, max = 2000, message = "Le message doit contenir entre 10 et 2000 caractères")
    @Column(nullable = false, length = 2000)
    private String message;

    /**
     * Lien optionnel vers un cours (utilisé quand typeAvis = AVIS_COURS).
     * On stocke uniquement l'ID du cours (référence inter-service).
     */
    @Column(name = "cours_id")
    private Long coursId;

    /**
     * Rôle de l'auteur au moment de l'envoi (null si visiteur anonyme).
     * Valeurs possibles : APPRENANT, ENSEIGNANT, ADMIN, ANONYME
     */
    @Column(name = "role_auteur", length = 20)
    private String roleAuteur;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 20)
    private StatutFeedback statut = StatutFeedback.EN_ATTENTE;

    /**
     * Réponse de l'admin (optionnel).
     */
    @Column(name = "reponse_admin", length = 2000)
    private String reponseAdmin;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_traitement")
    private LocalDateTime dateTraitement;
}
