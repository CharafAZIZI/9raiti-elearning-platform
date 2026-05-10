package com.MicroServiceSpring.MicroServiceSpring.Services.Quiz;
import com.MicroServiceSpring.MicroServiceSpring.DTO.Quiz.*;
import com.MicroServiceSpring.MicroServiceSpring.Exceptions.ResourceNotFoundException;
import com.MicroServiceSpring.MicroServiceSpring.Mappers.Quiz.QuizMapper;
import com.MicroServiceSpring.MicroServiceSpring.Models.Quiz.*;
import com.MicroServiceSpring.MicroServiceSpring.Repository.Quiz.QuestionRepository;
import com.MicroServiceSpring.MicroServiceSpring.Repository.Quiz.QuizRepository;
import com.MicroServiceSpring.MicroServiceSpring.Repository.Quiz.TentativeQuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizServiceImpl implements IQuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final TentativeQuizRepository tentativeRepository;
    private final QuizMapper              quizMapper;

    // ── Quiz CRUD ─────────────────────────────────────────────────────────────

    @Override
    public QuizDTO creerQuiz(QuizDTO dto, Long enseignantId) {
        Quiz quiz = quizMapper.toEntity(dto, enseignantId);
        return quizMapper.toDTO(quizRepository.save(quiz));
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizDTO> getMesQuiz(Long enseignantId) {
        return quizRepository.findByEnseignantId(enseignantId)
                .stream().map(quizMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public QuizDTO getQuizById(Long id, Long enseignantId) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz introuvable : " + id));
        if (enseignantId != null && !quiz.getEnseignantId().equals(enseignantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé.");
        }
        return quizMapper.toDTO(quiz);
    }

    @Override
    @Transactional(readOnly = true)
    public QuizDTO getQuizParApprenant(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz introuvable : " + id));
        if (!quiz.isActif()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Ce quiz n'est pas disponible.");
        }
        return quizMapper.toDTO(quiz);
    }

    @Override
    public QuizDTO mettreAJourQuiz(Long id, QuizDTO dto, Long enseignantId) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz introuvable : " + id));
        if (!quiz.getEnseignantId().equals(enseignantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé.");
        }
        quizMapper.updateEntity(quiz, dto);
        return quizMapper.toDTO(quizRepository.save(quiz));
    }

    @Override
    public void supprimerQuiz(Long id, Long enseignantId) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz introuvable : " + id));
        if (!quiz.getEnseignantId().equals(enseignantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé.");
        }
        quizRepository.delete(quiz);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizDTO> getQuizParCours(Long coursId) {
        return quizRepository.findByCoursId(coursId)
                .stream().map(quizMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizDTO> getQuizDisponiblesParCours(Long coursId) {
        return quizRepository.findByCoursIdAndActifTrue(coursId)
                .stream().map(quizMapper::toDTO).collect(Collectors.toList());
    }

    // ── Questions ─────────────────────────────────────────────────────────────

    @Override
    public QuestionDTO ajouterQuestion(Long quizId, QuestionDTO dto, Long enseignantId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz introuvable : " + quizId));

        if (!quiz.getEnseignantId().equals(enseignantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé.");
        }

        // Ordre = nombre de questions déjà présentes
        dto.setOrdre(quiz.getQuestions().size());

        // Créer la question en la liant au quiz
        Question question = quizMapper.toEntity(dto, quiz);

        // Sauvegarder directement via questionRepository (évite la double cascade)
        Question saved = questionRepository.save(question);

        return quizMapper.toDTO(saved);
    }

    @Override
    public QuestionDTO mettreAJourQuestion(Long questionId, QuestionDTO dto, Long enseignantId) {
        Question q = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question introuvable : " + questionId));
        if (!q.getQuiz().getEnseignantId().equals(enseignantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé.");
        }
        quizMapper.updateEntity(q, dto);
        return quizMapper.toDTO(questionRepository.save(q));
    }

    @Override
    public void supprimerQuestion(Long questionId, Long enseignantId) {
        Question q = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question introuvable : " + questionId));
        if (!q.getQuiz().getEnseignantId().equals(enseignantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé.");
        }
        questionRepository.delete(q);
    }

    // ── Tentatives ────────────────────────────────────────────────────────────

    @Override
    public TentativeQuizDTO soumettreQuiz(SoumettreQuizDTO dto, Long utilisateurId, String utilisateurNom) {
        Quiz quiz = quizRepository.findById(dto.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz introuvable."));
        if (!quiz.isActif()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ce quiz n'est pas disponible.");
        }

        List<Question>           questions       = quiz.getQuestions();
        int                      scoreBrut       = 0;
        List<ResultatReponseDTO> resultats       = new ArrayList<>();
        List<ReponseUtilisateur> reponsesEntites = new ArrayList<>();

        for (ReponseUtilisateurDTO repDto : dto.getReponses()) {
            Question question = questions.stream()
                    .filter(q -> q.getId().equals(repDto.getQuestionId()))
                    .findFirst().orElse(null);
            if (question == null) continue;

            Reponse sel = question.getReponses().stream()
                    .filter(r -> r.getId().equals(repDto.getReponseIdSelectionnee()))
                    .findFirst().orElse(null);

            boolean ok = sel != null && sel.isEstCorrecte();
            if (ok) scoreBrut++;

            String bonneReponse = question.getReponses().stream()
                    .filter(Reponse::isEstCorrecte).findFirst()
                    .map(Reponse::getTexte).orElse("");

            resultats.add(ResultatReponseDTO.builder()
                    .questionId(question.getId())
                    .questionTexte(question.getTexte())
                    .reponseSelectionneeId(repDto.getReponseIdSelectionnee())
                    .reponseSelectionneeTexte(sel != null ? sel.getTexte() : "—")
                    .estCorrecte(ok)
                    .reponseCorrecteTexte(bonneReponse)
                    .build());

            reponsesEntites.add(ReponseUtilisateur.builder()
                    .questionId(repDto.getQuestionId())
                    .reponseIdSelectionnee(repDto.getReponseIdSelectionnee())
                    .build());
        }

        int    nb       = questions.size();
        double sur20    = nb > 0 ? Math.round(((double) scoreBrut / nb * 20) * 10.0) / 10.0 : 0;

        TentativeQuiz tentative = TentativeQuiz.builder()
                .quiz(quiz)
                .utilisateurId(utilisateurId)
                .utilisateurNom(utilisateurNom)
                .scoreBrut(scoreBrut)
                .scoreSur20(sur20)
                .nombreQuestions(nb)
                .build();

        reponsesEntites.forEach(r -> { r.setTentative(tentative); tentative.getReponsesUtilisateur().add(r); });
        tentativeRepository.save(tentative);

        return quizMapper.toDTO(tentative, resultats);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TentativeQuizDTO> getMesTentatives(Long utilisateurId) {
        return tentativeRepository.findByUtilisateurIdOrderByDateTentativeDesc(utilisateurId)
                .stream().map(quizMapper::toDTOSansResultats).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TentativeQuizDTO getTentativeById(Long id, Long utilisateurId) {
        TentativeQuiz t = tentativeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tentative introuvable : " + id));
        if (!t.getUtilisateurId().equals(utilisateurId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé.");
        }

        List<ResultatReponseDTO> resultats = t.getReponsesUtilisateur().stream().map(ru -> {
            Question q = questionRepository.findById(ru.getQuestionId()).orElse(null);
            if (q == null) return null;
            Reponse sel = q.getReponses().stream()
                    .filter(r -> r.getId().equals(ru.getReponseIdSelectionnee())).findFirst().orElse(null);
            boolean ok = sel != null && sel.isEstCorrecte();
            String bonne = q.getReponses().stream().filter(Reponse::isEstCorrecte)
                    .findFirst().map(Reponse::getTexte).orElse("");
            return ResultatReponseDTO.builder()
                    .questionId(q.getId()).questionTexte(q.getTexte())
                    .reponseSelectionneeId(ru.getReponseIdSelectionnee())
                    .reponseSelectionneeTexte(sel != null ? sel.getTexte() : "—")
                    .estCorrecte(ok).reponseCorrecteTexte(bonne)
                    .build();
        }).filter(r -> r != null).collect(Collectors.toList());

        return quizMapper.toDTO(t, resultats);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TentativeQuizDTO> getTentativesParQuiz(Long quizId, Long enseignantId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz introuvable."));
        if (!quiz.getEnseignantId().equals(enseignantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé.");
        }
        return tentativeRepository.findByQuizIdOrderByDateTentativeDesc(quizId)
                .stream().map(quizMapper::toDTOSansResultats).collect(Collectors.toList());
    }
}
