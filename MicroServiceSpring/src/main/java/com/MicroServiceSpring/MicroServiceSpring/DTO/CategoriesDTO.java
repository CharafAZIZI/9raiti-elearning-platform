package com.MicroServiceSpring.MicroServiceSpring.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoriesDTO {

    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    private String description;
}
