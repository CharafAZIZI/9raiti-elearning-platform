package com.MicroServiceSpring.MicroServiceSpring.Models.Quiz;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reponse")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Reponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String texte;

    @Column(name = "est_correcte", nullable = false)
    private boolean estCorrecte = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;
}
