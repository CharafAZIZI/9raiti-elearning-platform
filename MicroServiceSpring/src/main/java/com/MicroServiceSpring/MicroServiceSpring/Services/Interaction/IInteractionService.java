package com.MicroServiceSpring.MicroServiceSpring.Services.Interaction;

import com.MicroServiceSpring.MicroServiceSpring.DTO.Interaction.*;
import java.util.List;

public interface IInteractionService {

    // Résumé complet des interactions d’un cours
    InteractionCoursDTO getInteractions(Long coursId);

    // Like / Unlike
    LikeResponseDTO toggleLike(Long coursId);

    // Notes
    NoteResponseDTO noterCours(Long coursId, Integer valeur);

    // Commentaires
    List<CommentaireDTO> getCommentaires(Long coursId);

    CommentaireDTO ajouterCommentaire(Long coursId, String contenu, String auteurNom);

    void supprimerCommentaire(Long coursId, Long commentaireId);
}