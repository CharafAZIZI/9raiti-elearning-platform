package com.MicroServiceSpring.MicroServiceSpring.Services.Quiz;

import com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz.QuestionDTO;
import com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz.QuizDTO;
import com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz.SoumettreQuizDTO;
import com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz.TentativeQuizDTO;

import java.util.List;

/**
 * Contrat du service Quiz.
 * L'injection via cette interface évite le couplage fort
 * entre le contrôleur et l'implémentation concrète.
 */
public interface IQuizService {

    // ── Quiz ─────────────────────────────────────────────────────────────────

    QuizDTO creerQuiz(QuizDTO dto, Long enseignantId);

    List<QuizDTO> getMesQuiz(Long enseignantId);

    QuizDTO getQuizById(Long id, Long enseignantId);

    QuizDTO getQuizParApprenant(Long id);

    QuizDTO mettreAJourQuiz(Long id, QuizDTO dto, Long enseignantId);

    void supprimerQuiz(Long id, Long enseignantId);

    List<QuizDTO> getQuizParCours(Long coursId);

    List<QuizDTO> getQuizDisponiblesParCours(Long coursId);

    // ── Questions ─────────────────────────────────────────────────────────────

    QuestionDTO ajouterQuestion(Long quizId, QuestionDTO dto, Long enseignantId);

    QuestionDTO mettreAJourQuestion(Long questionId, QuestionDTO dto, Long enseignantId);

    void supprimerQuestion(Long questionId, Long enseignantId);

    // ── Tentatives ────────────────────────────────────────────────────────────

    TentativeQuizDTO soumettreQuiz(SoumettreQuizDTO dto, Long utilisateurId, String utilisateurNom);

    List<TentativeQuizDTO> getMesTentatives(Long utilisateurId);

    TentativeQuizDTO getTentativeById(Long id, Long utilisateurId);

    List<TentativeQuizDTO> getTentativesParQuiz(Long quizId, Long enseignantId);
}
