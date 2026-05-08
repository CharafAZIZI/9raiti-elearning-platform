package com.MicroServiceSpring.MicroServiceSpring.Models.Interaction;

import com.MicroServiceSpring.MicroServiceSpring.Models.Cours.Cours;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "commentaires")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Commentaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cours_id", nullable = false)
    private Cours cours;

    @Column(name = "auteur_id", nullable = false)
    private Long auteurId;

    @Column(name = "auteur_nom")
    private String auteurNom;

    @Column(nullable = false, length = 500)
    private String contenu;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;
}
