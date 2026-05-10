package com.MicroServiceSpring.MicroServiceSpring.Controllers;

import com.MicroServiceSpring.MicroServiceSpring.DTO.Interaction.*;
import com.MicroServiceSpring.MicroServiceSpring.Security.JwtUtil;
import com.MicroServiceSpring.MicroServiceSpring.Services.Interaction.InteractionService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * GET    /api/interactions/cours/{coursId}                    → résumé complet
 * POST   /api/interactions/cours/{coursId}/like               → toggle like
 * POST   /api/interactions/cours/{coursId}/note               → noter (1-5)
 * GET    /api/interactions/cours/{coursId}/commentaires        → liste
 * POST   /api/interactions/cours/{coursId}/commentaires        → ajouter
 * DELETE /api/interactions/cours/{coursId}/commentaires/{id}   → supprimer
 */
@RestController
@RequestMapping("/api/interactions/cours/{coursId}")
@RequiredArgsConstructor
public class InteractionController {

    private final InteractionService interactionService;

    @GetMapping
    public ResponseEntity<InteractionCoursDTO> getInteractions(@PathVariable Long coursId) {
        return ResponseEntity.ok(interactionService.getInteractions(coursId));
    }

    @PostMapping("/like")
    public ResponseEntity<LikeResponseDTO> toggleLike(@PathVariable Long coursId) {
        return ResponseEntity.ok(interactionService.toggleLike(coursId));
    }

    @PostMapping("/note")
    public ResponseEntity<NoteResponseDTO> noter(
            @PathVariable Long coursId,
            @Valid @RequestBody NoteRequestDTO dto) {
        return ResponseEntity.ok(interactionService.noterCours(coursId, dto.getNote()));
    }

    @GetMapping("/commentaires")
    public ResponseEntity<List<CommentaireDTO>> getCommentaires(@PathVariable Long coursId) {
        return ResponseEntity.ok(interactionService.getCommentaires(coursId));
    }

    @PostMapping("/commentaires")
    public ResponseEntity<CommentaireDTO> ajouterCommentaire(
            @PathVariable Long coursId,
            @RequestBody CommentaireRequestDTO dto) {
        String nom = JwtUtil.getCurrentUserName();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(interactionService.ajouterCommentaire(coursId, dto.getContenu(), nom));
    }

    @DeleteMapping("/commentaires/{commentaireId}")
    public ResponseEntity<Void> supprimerCommentaire(
            @PathVariable Long coursId,
            @PathVariable Long commentaireId) {
        interactionService.supprimerCommentaire(coursId, commentaireId);
        return ResponseEntity.noContent().build();
    }

    // ── Inner DTO ─────────────────────────────────────────────────────────────
    @Data
    public static class CommentaireRequestDTO {
        private String contenu;
    }
}
