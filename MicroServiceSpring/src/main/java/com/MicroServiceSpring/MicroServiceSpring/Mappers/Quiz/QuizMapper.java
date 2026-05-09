package com.MicroServiceSpring.MicroServiceSpring.Mappers.Quiz;

import com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz.*;
import com.MicroServiceSpring.MicroServiceSpring.Models.Quiz.*;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class QuizMapper {

    public QuizDTO toDTO(Quiz quiz) {
        if (quiz == null) return null;
        List<Question> questions = quiz.getQuestions() != null ? quiz.getQuestions() : new ArrayList<>();
        return QuizDTO.builder()
                .id(quiz.getId())
                .titre(quiz.getTitre())
                .description(quiz.getDescription())
                .coursId(quiz.getCoursId())
                .actif(quiz.isActif())
                .dateCreation(quiz.getDateCreation())
                .nombreQuestions(questions.size())
                .config(ConfigQuizDTO.builder()
                        .correctionInstantanee(quiz.isCorrectionInstantanee())
                        .tempsLimiteMinutes(quiz.getTempsLimiteMinutes())
                        .randomiserQuestions(quiz.isRandomiserQuestions())
                        .randomiserReponses(quiz.isRandomiserReponses())
                        .build())
                .questions(questions.stream().map(this::toDTO).collect(Collectors.toList()))
                .build();
    }

    public Quiz toEntity(QuizDTO dto, Long enseignantId) {
        Quiz quiz = new Quiz();
        quiz.setTitre(dto.getTitre());
        quiz.setDescription(dto.getDescription());
        quiz.setCoursId(dto.getCoursId());
        quiz.setActif(dto.isActif());
        quiz.setEnseignantId(enseignantId);
        applyConfig(quiz, dto.getConfig());
        return quiz;
    }

    public void updateEntity(Quiz quiz, QuizDTO dto) {
        quiz.setTitre(dto.getTitre());
        quiz.setDescription(dto.getDescription());
        quiz.setCoursId(dto.getCoursId());
        quiz.setActif(dto.isActif());
        applyConfig(quiz, dto.getConfig());
    }

    private void applyConfig(Quiz quiz, ConfigQuizDTO cfg) {
        if (cfg == null) return;
        quiz.setCorrectionInstantanee(cfg.isCorrectionInstantanee());
        quiz.setTempsLimiteMinutes(cfg.getTempsLimiteMinutes());
        quiz.setRandomiserQuestions(cfg.isRandomiserQuestions());
        quiz.setRandomiserReponses(cfg.isRandomiserReponses());
    }

    public QuestionDTO toDTO(Question q) {
        if (q == null) return null;
        List<Reponse> reponses = q.getReponses() != null ? q.getReponses() : new ArrayList<>();
        return QuestionDTO.builder()
                .id(q.getId())
                .texte(q.getTexte())
                .type(q.getType())
                .ordre(q.getOrdre())
                .quizId(q.getQuiz() != null ? q.getQuiz().getId() : null)
                .reponses(reponses.stream().map(this::toDTO).collect(Collectors.toList()))
                .build();
    }

    public Question toEntity(QuestionDTO dto, Quiz quiz) {
        Question q = new Question();
        q.setTexte(dto.getTexte());
        q.setType(dto.getType());
        q.setOrdre(dto.getOrdre());
        q.setQuiz(quiz);
        if (q.getReponses() == null) q.setReponses(new ArrayList<>());
        if (dto.getReponses() != null) {
            q.setReponses(dto.getReponses().stream().map(r -> toEntity(r, q)).collect(Collectors.toList()));
        }
        return q;
    }

    public void updateEntity(Question q, QuestionDTO dto) {
        q.setTexte(dto.getTexte());
        q.setType(dto.getType());
        q.setOrdre(dto.getOrdre());
        q.getReponses().clear();
        if (dto.getReponses() != null) {
            dto.getReponses().forEach(r -> q.getReponses().add(toEntity(r, q)));
        }
    }

    public ReponseDTO toDTO(Reponse r) {
        if (r == null) return null;
        return ReponseDTO.builder()
                .id(r.getId()).texte(r.getTexte()).estCorrecte(r.isEstCorrecte())
                .questionId(r.getQuestion() != null ? r.getQuestion().getId() : null)
                .build();
    }

    public Reponse toEntity(ReponseDTO dto, Question question) {
        Reponse r = new Reponse();
        r.setTexte(dto.getTexte());
        r.setEstCorrecte(dto.getEstCorrecte());
        r.setQuestion(question);
        return r;
    }

    public TentativeQuizDTO toDTO(TentativeQuiz t, List<ResultatReponseDTO> resultats) {
        return TentativeQuizDTO.builder()
                .id(t.getId())
                .quizId(t.getQuiz().getId())
                .quizTitre(t.getQuiz().getTitre())
                .utilisateurId(t.getUtilisateurId())
                .utilisateurNom(t.getUtilisateurNom())
                .scoreBrut(t.getScoreBrut())
                .scoreSur20(t.getScoreSur20())
                .nombreQuestions(t.getNombreQuestions())
                .dateTentative(t.getDateTentative())
                .resultats(resultats)
                .build();
    }

    public TentativeQuizDTO toDTOSansResultats(TentativeQuiz t) {
        return toDTO(t, null);
    }
}
