package com.MicroServiceSpring.MicroServiceSpring.Models.Quiz;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quiz")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "cours_id", nullable = false)
    private Long coursId;

    @Column(name = "enseignant_id", nullable = false)
    private Long enseignantId;

    @Column(nullable = false)
    @Builder.Default
    private boolean actif = true;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "correction_instantanee", nullable = false)
    @Builder.Default
    private boolean correctionInstantanee = false;

    @Column(name = "temps_limite_minutes")
    private Integer tempsLimiteMinutes;

    @Column(name = "randomiser_questions", nullable = false)
    @Builder.Default
    private boolean randomiserQuestions = false;

    @Column(name = "randomiser_reponses", nullable = false)
    @Builder.Default
    private boolean randomiserReponses = false;

    /**
     * EAGER obligatoire : ajouterQuestion() et soumettreQuiz() accèdent à cette
     * liste potentiellement hors d'une session Hibernate active.
     */
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true,
               fetch = FetchType.EAGER)
    @OrderBy("ordre ASC")
    @Builder.Default
    private List<Question> questions = new ArrayList<>();

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true,
               fetch = FetchType.LAZY)
    @Builder.Default
    private List<TentativeQuiz> tentatives = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (this.dateCreation == null) this.dateCreation = LocalDateTime.now();
    }
}
