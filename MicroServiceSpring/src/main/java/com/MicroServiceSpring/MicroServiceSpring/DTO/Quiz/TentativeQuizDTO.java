package com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TentativeQuizDTO {
    private Long id;
    private Long quizId;
    private String quizTitre;
    private Long utilisateurId;
    private String utilisateurNom;
    private int scoreBrut;
    private double scoreSur20;
    private int nombreQuestions;
    private LocalDateTime dateTentative;
    private List<ResultatReponseDTO> resultats;
}
