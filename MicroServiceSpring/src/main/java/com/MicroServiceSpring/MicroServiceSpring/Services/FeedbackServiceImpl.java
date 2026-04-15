package com.MicroServiceSpring.MicroServiceSpring.Services;
import com.MicroServiceSpring.MicroServiceSpring.DTO.FeedbackDTO;
import com.MicroServiceSpring.MicroServiceSpring.DTO.FeedbackReponseDTO;
import com.MicroServiceSpring.MicroServiceSpring.Exceptions.ResourceNotFoundException;
import com.MicroServiceSpring.MicroServiceSpring.Mappers.FeedbackMapper;
import com.MicroServiceSpring.MicroServiceSpring.Models.Feedback;
import com.MicroServiceSpring.MicroServiceSpring.Models.StatutFeedback;
import com.MicroServiceSpring.MicroServiceSpring.Models.TypeAvis;
import com.MicroServiceSpring.MicroServiceSpring.Repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final FeedbackMapper feedbackMapper;

    // ── Soumission visiteur anonyme ───────────────────────────────────────────

    @Override
    @Transactional
    public FeedbackDTO soumettreAnonyme(FeedbackDTO dto) {
        Feedback feedback = feedbackMapper.toEntity(dto);
        feedback.setRoleAuteur("ANONYME");
        return feedbackMapper.toDTO(feedbackRepository.save(feedback));
    }

    // ── Soumission utilisateur connecté (email + role extraits du JWT) ────────

    @Override
    @Transactional
    public FeedbackDTO soumettreAuthentifie(FeedbackDTO dto, String email, String role) {
        Feedback feedback = feedbackMapper.toEntity(dto);
        // On écrase l'email du DTO par celui du JWT (sécurité : le client ne peut pas usurper)
        feedback.setEmail(email);
        feedback.setRoleAuteur(role);
        return feedbackMapper.toDTO(feedbackRepository.save(feedback));
    }

    // ── Lecture Admin ─────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackDTO> getAll() {
        return feedbackRepository.findAll()
                .stream()
                .map(feedbackMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackDTO> getByType(TypeAvis type) {
        return feedbackRepository.findByTypeAvis(type)
                .stream()
                .map(feedbackMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackDTO> getByStatut(StatutFeedback statut) {
        return feedbackRepository.findByStatut(statut)
                .stream()
                .map(feedbackMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackDTO> getByTypeAndStatut(TypeAvis type, StatutFeedback statut) {
        return feedbackRepository.findByTypeAvisAndStatut(type, statut)
                .stream()
                .map(feedbackMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FeedbackDTO getById(Long id) {
        return feedbackRepository.findById(id)
                .map(feedbackMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback introuvable avec l'id : " + id));
    }

    // ── Lecture Enseignant (avis sur ses cours) ───────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackDTO> getByCoursId(Long coursId) {
        return feedbackRepository.findByCoursId(coursId)
                .stream()
                .map(feedbackMapper::toDTO)
                .toList();
    }

    // ── Traitement Admin : répondre + changer statut ──────────────────────────

    @Override
    @Transactional
    public FeedbackDTO repondre(Long id, FeedbackReponseDTO reponseDTO) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback introuvable avec l'id : " + id));

        feedback.setStatut(reponseDTO.getStatut());
        feedback.setReponseAdmin(reponseDTO.getReponseAdmin());
        feedback.setDateTraitement(LocalDateTime.now());

        return feedbackMapper.toDTO(feedbackRepository.save(feedback));
    }

    // ── Suppression Admin ─────────────────────────────────────────────────────

    @Override
    @Transactional
    public void supprimer(Long id) {
        if (!feedbackRepository.existsById(id)) {
            throw new ResourceNotFoundException("Feedback introuvable avec l'id : " + id);
        }
        feedbackRepository.deleteById(id);
    }

    @Override
    public List<FeedbackDTO> getFeedbacksByEmail(String email) {
        return feedbackRepository
                .findByEmailOrderByDateCreationDesc(email)
                .stream()
                .map(feedbackMapper::toDTO)  // ou votre méthode de conversion
                .collect(Collectors.toList());
    }
}
