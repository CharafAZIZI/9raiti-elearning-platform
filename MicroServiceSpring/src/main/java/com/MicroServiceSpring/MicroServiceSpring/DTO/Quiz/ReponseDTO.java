package com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReponseDTO {
    private Long id;
    @NotBlank(message = "Le texte de la réponse est obligatoire")
    private String texte;
    private Boolean estCorrecte;
    private Long questionId;
}
