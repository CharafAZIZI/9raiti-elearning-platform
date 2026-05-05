package com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SoumettreQuizDTO {
    @NotNull
    private Long quizId;
    @NotEmpty
    @Valid
    private List<ReponseUtilisateurDTO> reponses;
}
