package com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ConfigQuizDTO {
    private boolean correctionInstantanee = false;
    private Integer tempsLimiteMinutes;
    private boolean randomiserQuestions   = false;
    private boolean randomiserReponses    = false;
}
