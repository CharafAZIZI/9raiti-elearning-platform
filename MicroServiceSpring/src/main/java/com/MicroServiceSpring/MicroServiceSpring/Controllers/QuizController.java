package com.MicroServiceSpring.MicroServiceSpring.Controllers;

import com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz.QuestionDTO;
import com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz.QuizDTO;
import com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz.SoumettreQuizDTO;
import com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz.TentativeQuizDTO;
import com.MicroServiceSpring.MicroServiceSpring.Services.Quiz.IQuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final IQuizService quizService;

    // ── Quiz ─────────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<QuizDTO> creerQuiz(@Valid @RequestBody QuizDTO dto, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(quizService.creerQuiz(dto, getUserId(auth)));
    }

    @GetMapping("/mes-quiz")
    public ResponseEntity<List<QuizDTO>> getMesQuiz(Authentication auth) {
        return ResponseEntity.ok(quizService.getMesQuiz(getUserId(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizDTO> getQuizById(@PathVariable Long id, Authentication auth) {
        if (hasRole(auth, "enseignant")) {
            return ResponseEntity.ok(quizService.getQuizById(id, getUserId(auth)));
        }
        return ResponseEntity.ok(quizService.getQuizParApprenant(id));
    }

    @GetMapping("/cours/{coursId}")
    public ResponseEntity<List<QuizDTO>> getQuizParCours(@PathVariable Long coursId) {
        return ResponseEntity.ok(quizService.getQuizParCours(coursId));
    }

    @GetMapping("/cours/{coursId}/disponibles")
    public ResponseEntity<List<QuizDTO>> getQuizDisponibles(@PathVariable Long coursId) {
        return ResponseEntity.ok(quizService.getQuizDisponiblesParCours(coursId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuizDTO> mettreAJourQuiz(@PathVariable Long id,
                                                   @Valid @RequestBody QuizDTO dto,
                                                   Authentication auth) {
        return ResponseEntity.ok(quizService.mettreAJourQuiz(id, dto, getUserId(auth)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerQuiz(@PathVariable Long id, Authentication auth) {
        quizService.supprimerQuiz(id, getUserId(auth));
        return ResponseEntity.noContent().build();
    }

    // ── Questions ─────────────────────────────────────────────────────────────

    @PostMapping("/{quizId}/questions")
    public ResponseEntity<QuestionDTO> ajouterQuestion(@PathVariable Long quizId,
                                                       @Valid @RequestBody QuestionDTO dto,
                                                       Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(quizService.ajouterQuestion(quizId, dto, getUserId(auth)));
    }

    @PutMapping("/questions/{questionId}")
    public ResponseEntity<QuestionDTO> mettreAJourQuestion(@PathVariable Long questionId,
                                                           @Valid @RequestBody QuestionDTO dto,
                                                           Authentication auth) {
        return ResponseEntity.ok(quizService.mettreAJourQuestion(questionId, dto, getUserId(auth)));
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<Void> supprimerQuestion(@PathVariable Long questionId, Authentication auth) {
        quizService.supprimerQuestion(questionId, getUserId(auth));
        return ResponseEntity.noContent().build();
    }

    // ── Tentatives ────────────────────────────────────────────────────────────

    @PostMapping("/soumettre")
    public ResponseEntity<TentativeQuizDTO> soumettreQuiz(@Valid @RequestBody SoumettreQuizDTO dto,
                                                          Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(quizService.soumettreQuiz(dto, getUserId(auth), getDisplayName(auth)));
    }

    @GetMapping("/mes-tentatives")
    public ResponseEntity<List<TentativeQuizDTO>> getMesTentatives(Authentication auth) {
        return ResponseEntity.ok(quizService.getMesTentatives(getUserId(auth)));
    }

    @GetMapping("/tentatives/{id}")
    public ResponseEntity<TentativeQuizDTO> getTentativeById(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(quizService.getTentativeById(id, getUserId(auth)));
    }

    @GetMapping("/{quizId}/tentatives")
    public ResponseEntity<List<TentativeQuizDTO>> getTentativesParQuiz(@PathVariable Long quizId,
                                                                       Authentication auth) {
        return ResponseEntity.ok(quizService.getTentativesParQuiz(quizId, getUserId(auth)));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // EXTRACTION JWT
    // Le filtre JwtAuthenticationFilter stocke l'userId dans auth.getDetails().
    // JJWT lit les entiers JSON comme Integer, pas String → userId est un Integer
    // ou Long dans details, jamais null si le claim nameidentifier est présent.
    // ══════════════════════════════════════════════════════════════════════════

    private Long getUserId(Authentication auth) {
        if (auth == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non authentifié.");
        }

        Object details = auth.getDetails();

        // Cas normal : JwtAuthenticationFilter a bien extrait l'ID
        if (details instanceof Long)    return (Long) details;
        if (details instanceof Integer) return ((Integer) details).longValue();

        // Cas de secours : si details est null (claim nameidentifier absent du JWT)
        throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Identifiant utilisateur introuvable dans le token. " +
                        "Le service .NET doit inclure ClaimTypes.NameIdentifier avec l'ID numérique."
        );
    }

    private boolean hasRole(Authentication auth, String role) {
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority()
                        .replace("ROLE_", "")
                        .equalsIgnoreCase(role));
    }

    private String getDisplayName(Authentication auth) {
        return auth != null ? auth.getName() : "Anonyme";
    }
}
