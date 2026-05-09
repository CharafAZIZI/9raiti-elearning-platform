package com.MicroServiceSpring.MicroServiceSpring.Controllers;

import com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz.QuizDTO;
import com.MicroServiceSpring.MicroServiceSpring.Services.Quiz.IQuizAIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/quiz-ai")
@RequiredArgsConstructor
public class QuizAIController {

    private final IQuizAIService quizAIService;

    @PostMapping(value = "/generate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<QuizDTO> genererQuiz(
            @RequestParam("file")                                                     MultipartFile file,
            @RequestParam("coursId")                                                  Long          coursId,
            @RequestParam("nombreQuestions")                                          int           nombreQuestions,
            @RequestParam("difficulte")                                               String        difficulte,
            @RequestParam("typeQuestions")                                            String        typeQuestions,
            @RequestParam(value = "titre",                  required = false)         String        titre,
            @RequestParam(value = "correctionInstantanee",  required = false, defaultValue = "false") boolean correctionInstantanee,
            @RequestParam(value = "randomiserQuestions",    required = false, defaultValue = "false") boolean randomiserQuestions,
            Authentication auth) {

        Long enseignantId = getUserId(auth);
        log.info("📨 Génération quiz IA : {} questions, cours #{}", nombreQuestions, coursId);

        try {
            QuizDTO quiz = quizAIService.genererQuizDepuisPdf(
                    file, coursId, nombreQuestions, difficulte,
                    typeQuestions, titre, correctionInstantanee,
                    randomiserQuestions, enseignantId
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(quiz);

        } catch (Exception e) {
            log.error("❌ Erreur génération quiz IA", e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Échec de la génération du quiz : " + e.getMessage()
            );
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "quiz-ai",
                "timestamp", System.currentTimeMillis()
        ));
    }

    private Long getUserId(Authentication auth) {
        if (auth == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non authentifié.");
        }
        Object details = auth.getDetails();
        if (details instanceof Long)    return (Long) details;
        if (details instanceof Integer) return ((Integer) details).longValue();
        throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "ID utilisateur introuvable."
        );
    }
}