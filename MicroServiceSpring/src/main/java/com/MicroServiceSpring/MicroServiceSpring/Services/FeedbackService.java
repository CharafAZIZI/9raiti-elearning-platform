package com.MicroServiceSpring.MicroServiceSpring.Services;
import com.MicroServiceSpring.MicroServiceSpring.DTO.FeedbackDTO;
import com.MicroServiceSpring.MicroServiceSpring.DTO.FeedbackReponseDTO;
import com.MicroServiceSpring.MicroServiceSpring.Models.StatutFeedback;
import com.MicroServiceSpring.MicroServiceSpring.Models.TypeAvis;

import java.util.List;

public interface FeedbackService {

    // ── Soumission (public + authentifié) ─────────────────────────────────────
    FeedbackDTO soumettreAnonyme(FeedbackDTO dto);
    FeedbackDTO soumettreAuthentifie(FeedbackDTO dto, String email, String role);

    // ── Consultation Admin (tous les feedbacks) ───────────────────────────────
    List<FeedbackDTO> getAll();
    List<FeedbackDTO> getByType(TypeAvis type);
    List<FeedbackDTO> getByStatut(StatutFeedback statut);
    List<FeedbackDTO> getByTypeAndStatut(TypeAvis type, StatutFeedback statut);
    FeedbackDTO getById(Long id);

    // ── Consultation Enseignant (avis sur ses cours) ──────────────────────────
    List<FeedbackDTO> getByCoursId(Long coursId);

    // ── Traitement Admin ──────────────────────────────────────────────────────
    FeedbackDTO repondre(Long id, FeedbackReponseDTO reponseDTO);

    // ── Suppression Admin ─────────────────────────────────────────────────────
    void supprimer(Long id);
}
