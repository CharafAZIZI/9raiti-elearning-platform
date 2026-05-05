package com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReponseUtilisateurDTO {
    @NotNull
    private Long questionId;
    @NotNull
    private Long reponseIdSelectionnee;
}
