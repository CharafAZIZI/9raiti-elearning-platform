package com.MicroServiceSpring.MicroServiceSpring.Services.Quiz;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GroqService implements IGroqService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${groq.api.key}")
    private String groqApiKey;

    private static final String GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions";
    private static final String GROQ_MODEL = "llama-3.3-70b-versatile";

    @Autowired
    public GroqService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public String genererQuizJson(String texte, int nombreQuestions,
                                  String difficulte, String typeQuestions) {

        log.info("🤖 Appel Groq API : {} questions, difficulté {}", nombreQuestions, difficulte);

        String texteTronque = texte.length() > 4000 ? texte.substring(0, 4000) : texte;
        String prompt = construirePrompt(texteTronque, nombreQuestions, difficulte, typeQuestions);
        String reponse = appelGroq(prompt);

        log.info("✅ Réponse Groq reçue : {} caractères", reponse.length());
        return reponse;
    }

    private String construirePrompt(String texte, int nombreQuestions,
                                    String difficulte, String typeQuestions) {
        String instructionsType = switch (typeQuestions) {
            case "QCM"       -> "Génère UNIQUEMENT des QCM avec 4 réponses possibles.";
            case "VRAI_FAUX" -> "Génère UNIQUEMENT des questions Vrai/Faux avec 2 réponses.";
            case "MIXTE"     -> "Génère un mélange de QCM et Vrai/Faux.";
            default          -> "Génère des QCM avec 4 réponses possibles.";
        };

        return String.format("""
            Tu es un expert en création de quiz pédagogiques.

            CONSIGNES STRICTES:
            1. Génère exactement %d questions de niveau %s
            2. %s
            3. Une seule bonne réponse par question
            4. Réponds UNIQUEMENT avec du JSON valide, sans texte avant ou après

            FORMAT JSON ATTENDU:
            {
              "questions": [
                {
                  "texte": "Question?",
                  "type": "QCM",
                  "reponses": [
                    {"texte": "Réponse A", "estCorrecte": true},
                    {"texte": "Réponse B", "estCorrecte": false},
                    {"texte": "Réponse C", "estCorrecte": false},
                    {"texte": "Réponse D", "estCorrecte": false}
                  ]
                }
              ]
            }

            TEXTE À ANALYSER:
            %s

            JSON UNIQUEMENT:
            """, nombreQuestions, difficulte, instructionsType, texte);
    }

    private String appelGroq(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + groqApiKey);

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> body = new HashMap<>();
        body.put("model", GROQ_MODEL);
        body.put("messages", List.of(message));
        body.put("max_tokens", 4096);
        body.put("temperature", 0.3);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    GROQ_URL, HttpMethod.POST, entity, String.class
            );
            return extraireTexte(response.getBody());
        } catch (Exception e) {
            log.error("❌ Erreur Groq API", e);
            throw new RuntimeException(
                    "Impossible de contacter Groq API : " + e.getMessage(), e
            );
        }
    }

    private String extraireTexte(String groqResponse) {
        try {
            JsonNode root = objectMapper.readTree(groqResponse);
            return root.get("choices").get(0).get("message").get("content").asText();
        } catch (Exception e) {
            log.error("❌ Erreur parsing réponse Groq", e);
            throw new RuntimeException("Format de réponse Groq invalide", e);
        }
    }
}