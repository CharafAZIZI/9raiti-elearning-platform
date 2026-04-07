package com.MicroServiceSpring.MicroServiceSpring.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class ModuleDTO {

    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    @NotBlank(message = "Le code est obligatoire")
    private String code;

    private boolean actif;

    private Long categorieId;

    private List<CoursDTO> cours;
}
