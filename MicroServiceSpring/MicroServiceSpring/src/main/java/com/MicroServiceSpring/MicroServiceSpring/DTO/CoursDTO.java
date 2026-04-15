package com.MicroServiceSpring.MicroServiceSpring.DTO;

import com.MicroServiceSpring.MicroServiceSpring.Models.Niveau;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CoursDTO {

    private Long idCours;

    @NotBlank
    private String titre;

    @NotBlank
    private String description;

    @NotNull
    private Niveau niveau;

    private LocalDateTime dateCreation;

    private Integer nombreInscrits;

    private String filePath;

    @NotNull
    private Long moduleId;
}