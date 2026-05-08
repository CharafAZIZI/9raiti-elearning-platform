package com.MicroServiceSpring.MicroServiceSpring.DTO.Interaction;

import lombok.Data;
import java.util.List;

@Data
public class InteractionCoursDTO {
    private Long coursId;
    private long totalLikes;
    private boolean userALike;
    private Integer noteUtilisateur;
    private Double moyenneNotes;
    private Long totalNotes;
    private List<CommentaireDTO> commentaires;
}
