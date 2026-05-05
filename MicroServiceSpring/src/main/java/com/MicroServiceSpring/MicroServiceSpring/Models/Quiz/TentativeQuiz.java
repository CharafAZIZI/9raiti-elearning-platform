package com.MicroServiceSpring.MicroServiceSpring.Models.Quiz;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tentative_quiz")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TentativeQuiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "utilisateur_id", nullable = false)
    private Long utilisateurId;

    @Column(name = "utilisateur_nom")
    private String utilisateurNom;

    @Column(name = "score_brut", nullable = false)
    private int scoreBrut;

    @Column(name = "score_sur_20", nullable = false)
    private double scoreSur20;

    @Column(name = "nombre_questions", nullable = false)
    private int nombreQuestions;

    @Column(name = "date_tentative", nullable = false)
    private LocalDateTime dateTentative;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @OneToMany(mappedBy = "tentative", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ReponseUtilisateur> reponsesUtilisateur = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (this.dateTentative == null) this.dateTentative = LocalDateTime.now();
    }
}
