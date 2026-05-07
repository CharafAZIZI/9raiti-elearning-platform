package com.MicroServiceSpring.MicroServiceSpring.Services.Quiz;

import com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz.ConfigQuizDTO;
import com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz.QuestionDTO;
import com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz.QuizDTO;
import com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz.ReponseDTO;
import com.MicroServiceSpring.MicroServiceSpring.Models.Quiz.TypeQuestion;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuizAIService implements IQuizAIService {

    private final IGroqService  groqService;
    private final IQuizService  quizService;
    private final ObjectMapper  objectMapper;

    @Override
    public QuizDTO genererQuizDepuisPdf(
            MultipartFile file,
            Long coursId,
            int nombreQuestions,
            String difficulte,
            String typeQuestions,
            String titre,
            boolean correctionInstantanee,
            boolean randomiserQuestions,
            Long enseignantId) {

        log.info("🚀 Génération quiz IA pour cours #{}", coursId);

        // Étape 1 — Extraire le texte du PDF
        String texte = extraireTextePdf(file);

        // Étape 2 — Générer le JSON via Groq
        String jsonQuiz = groqService.genererQuizJson(
                texte, nombreQuestions, difficulte, typeQuestions
        );

        // Étape 3 — Parser le JSON
        List<QuestionDTO> questions = parserQuestions(jsonQuiz);

        // Étape 4 — Créer le quiz
        String titreFinal = (titre != null && !titre.isBlank())
                ? titre
                : "Quiz IA - " + LocalDateTime.now().toLocalDate();

        QuizDTO quizDTO = QuizDTO.builder()
                .titre(titreFinal)
                .coursId(coursId)
                .actif(true)
                .questions(questions)
                .config(ConfigQuizDTO.builder()
                        .correctionInstantanee(correctionInstantanee)
                        .randomiserQuestions(randomiserQuestions)
                        .randomiserReponses(false)
                        .build())
                .build();

        QuizDTO quizCree = quizService.creerQuiz(quizDTO, enseignantId);

        // Étape 5 — Ajouter les questions
        for (QuestionDTO q : questions) {
            q.setQuizId(quizCree.getId());
            quizService.ajouterQuestion(quizCree.getId(), q, enseignantId);
        }

        log.info("✅ Quiz #{} généré avec {} questions", quizCree.getId(), questions.size());
        return quizService.getQuizById(quizCree.getId(), enseignantId);
    }

    private String extraireTextePdf(MultipartFile file) {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String texte = stripper.getText(document);
            log.info("📄 PDF extrait : {} caractères", texte.length());
            return texte;
        } catch (Exception e) {
            log.error("❌ Erreur extraction PDF", e);
            throw new RuntimeException(
                    "Impossible d'extraire le texte du PDF : " + e.getMessage(), e
            );
        }
    }

    private List<QuestionDTO> parserQuestions(String jsonQuiz) {
        try {
            String jsonNettoye = jsonQuiz
                    .replaceAll("```json", "")
                    .replaceAll("```", "")
                    .trim();

            JsonNode root      = objectMapper.readTree(jsonNettoye);
            JsonNode questions = root.get("questions");

            if (questions == null || !questions.isArray()) {
                throw new RuntimeException("Format JSON invalide : 'questions' manquant");
            }

            List<QuestionDTO> result = new ArrayList<>();
            int ordre = 0;

            for (JsonNode qNode : questions) {
                List<ReponseDTO> reponses = new ArrayList<>();
                for (JsonNode rNode : qNode.get("reponses")) {
                    reponses.add(ReponseDTO.builder()
                            .texte(rNode.get("texte").asText())
                            .estCorrecte(rNode.get("estCorrecte").asBoolean())
                            .build());
                }

                TypeQuestion type;
                try {
                    type = TypeQuestion.valueOf(
                            qNode.get("type").asText().toUpperCase()
                    );
                } catch (Exception e) {
                    type = TypeQuestion.QCM;
                }

                result.add(QuestionDTO.builder()
                        .texte(qNode.get("texte").asText())
                        .type(type)
                        .ordre(ordre++)
                        .reponses(reponses)
                        .build());
            }

            log.info("📝 {} questions parsées", result.size());
            return result;

        } catch (Exception e) {
            log.error("❌ Erreur parsing JSON Groq", e);
            throw new RuntimeException(
                    "Impossible de parser la réponse de l'IA : " + e.getMessage(), e
            );
        }
    }
}