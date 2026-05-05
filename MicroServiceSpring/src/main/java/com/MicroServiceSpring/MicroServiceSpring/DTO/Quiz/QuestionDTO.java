package com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz;

import com.MicroServiceSpring.MicroServiceSpring.Models.Quiz.TypeQuestion;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuestionDTO {
    private Long id;
    @NotBlank(message = "Le texte de la question est obligatoire")
    private String texte;
    @NotNull(message = "Le type de question est obligatoire")
    private TypeQuestion type;
    private Integer ordre;
    private Long quizId;
    @NotEmpty(message = "Au moins une réponse est requise")
    @Valid
    private List<ReponseDTO> reponses;
}
