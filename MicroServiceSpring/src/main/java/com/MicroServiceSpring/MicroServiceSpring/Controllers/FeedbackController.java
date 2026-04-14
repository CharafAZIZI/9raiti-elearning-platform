package com.MicroServiceSpring.MicroServiceSpring.Controllers;
import com.MicroServiceSpring.MicroServiceSpring.DTO.FeedbackDTO;
import com.MicroServiceSpring.MicroServiceSpring.DTO.FeedbackReponseDTO;
import com.MicroServiceSpring.MicroServiceSpring.Models.StatutFeedback;
import com.MicroServiceSpring.MicroServiceSpring.Models.TypeAvis;
import com.MicroServiceSpring.MicroServiceSpring.Services.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    // =========================================================================
    // SOUMISSION
    // =========================================================================

    /**
     * POST /api/feedbacks/anonyme
     * Accessible sans JWT (visiteur depuis la page Home).
     */
    @PostMapping("/anonyme")
    public ResponseEntity<FeedbackDTO> soumettreAnonyme(@Valid @RequestBody FeedbackDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(feedbackService.soumettreAnonyme(dto));
    }

    /**
     * POST /api/feedbacks
     * Accessible aux utilisateurs connectés (Apprenant / Enseignant).
     * L'email et le rôle sont extraits du JWT côté serveur (sécurisé).
     */
    @PostMapping
    public ResponseEntity<FeedbackDTO> soumettreAuthentifie(
            @Valid @RequestBody FeedbackDTO dto,
            Authentication authentication) {

        // Le principal = email (cf. JwtAuthenticationFilter)
        String email = authentication.getName();
        // Le rôle vient des authorities (format "ROLE_APPRENANT" → on garde juste "APPRENANT")
        String role = authentication.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("INCONNU");

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(feedbackService.soumettreAuthentifie(dto, email, role));
    }

    // =========================================================================
    // LECTURE — ADMIN
    // =========================================================================

    /**
     * GET /api/feedbacks
     * Liste tous les feedbacks.
     * Filtre optionnel : ?type=RECLAMATION&statut=EN_ATTENTE
     */
    @GetMapping
    public ResponseEntity<List<FeedbackDTO>> getAll(
            @RequestParam(required = false) TypeAvis type,
            @RequestParam(required = false) StatutFeedback statut) {

        if (type != null && statut != null) {
            return ResponseEntity.ok(feedbackService.getByTypeAndStatut(type, statut));
        }
        if (type != null) {
            return ResponseEntity.ok(feedbackService.getByType(type));
        }
        if (statut != null) {
            return ResponseEntity.ok(feedbackService.getByStatut(statut));
        }
        return ResponseEntity.ok(feedbackService.getAll());
    }

    /**
     * GET /api/feedbacks/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<FeedbackDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(feedbackService.getById(id));
    }

    // =========================================================================
    // LECTURE — ENSEIGNANT (avis sur ses cours)
    // =========================================================================

    /**
     * GET /api/feedbacks/cours/{coursId}
     * Accessible à l'enseignant pour consulter les avis sur un de ses cours.
     */
    @GetMapping("/cours/{coursId}")
    public ResponseEntity<List<FeedbackDTO>> getByCours(@PathVariable Long coursId) {
        return ResponseEntity.ok(feedbackService.getByCoursId(coursId));
    }

    // =========================================================================
    // TRAITEMENT — ADMIN
    // =========================================================================

    /**
     * PUT /api/feedbacks/{id}/repondre
     * L'admin répond à un feedback et change son statut.
     */
    @PutMapping("/{id}/repondre")
    public ResponseEntity<FeedbackDTO> repondre(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackReponseDTO reponseDTO) {
        return ResponseEntity.ok(feedbackService.repondre(id, reponseDTO));
    }

    // =========================================================================
    // SUPPRESSION — ADMIN
    // =========================================================================

    /**
     * DELETE /api/feedbacks/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        feedbackService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
