package com.MicroServiceSpring.MicroServiceSpring.DTO.Interaction;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CommentaireDTO {
    private Long id;
    private Long coursId;
    private Long auteurId;
    private String auteurNom;
    private String contenu;
    private LocalDateTime dateCreation;
}
