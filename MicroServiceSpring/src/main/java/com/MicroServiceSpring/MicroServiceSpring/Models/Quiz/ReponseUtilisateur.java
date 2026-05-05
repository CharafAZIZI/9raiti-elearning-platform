package com.MicroServiceSpring.MicroServiceSpring.Models.Quiz;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reponse_utilisateur")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReponseUtilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Column(name = "reponse_id_selectionnee", nullable = false)
    private Long reponseIdSelectionnee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tentative_id", nullable = false)
    private TentativeQuiz tentative;
}
