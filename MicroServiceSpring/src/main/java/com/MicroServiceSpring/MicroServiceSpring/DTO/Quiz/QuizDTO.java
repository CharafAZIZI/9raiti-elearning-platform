package com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizDTO {
    private Long id;
    @NotBlank(message = "Le titre est obligatoire")
    @Size(min = 3, message = "Le titre doit contenir au moins 3 caractères")
    private String titre;
    private String description;
    @NotNull(message = "Le cours est obligatoire")
    private Long coursId;
    private String coursTitre;
    @NotNull(message = "La configuration est obligatoire")
    @Valid
    private ConfigQuizDTO config;
    private List<QuestionDTO> questions;
    private Integer nombreQuestions;
    private LocalDateTime dateCreation;
    private boolean actif = true;
}
