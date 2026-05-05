package com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResultatReponseDTO {
    private Long questionId;
    private String questionTexte;
    private Long reponseSelectionneeId;
    private String reponseSelectionneeTexte;
    private boolean estCorrecte;
    private String reponseCorrecteTexte;
}
