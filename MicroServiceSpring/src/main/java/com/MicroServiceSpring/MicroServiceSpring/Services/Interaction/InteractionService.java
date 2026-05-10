package com.MicroServiceSpring.MicroServiceSpring.Services.Interaction;

import com.MicroServiceSpring.MicroServiceSpring.DTO.Interaction.*;
import com.MicroServiceSpring.MicroServiceSpring.DTO.event.CourseInteractionEvent;
import com.MicroServiceSpring.MicroServiceSpring.Exceptions.ResourceNotFoundException;
import com.MicroServiceSpring.MicroServiceSpring.Models.Cours.Cours;
import com.MicroServiceSpring.MicroServiceSpring.Models.Interaction.Commentaire;
import com.MicroServiceSpring.MicroServiceSpring.Models.Interaction.Like;
import com.MicroServiceSpring.MicroServiceSpring.Models.Interaction.Note;
import com.MicroServiceSpring.MicroServiceSpring.Repository.*;
import com.MicroServiceSpring.MicroServiceSpring.Repository.Cours.CoursRepository;
import com.MicroServiceSpring.MicroServiceSpring.Security.JwtUtil;
import com.MicroServiceSpring.MicroServiceSpring.kafka.producer.EventProducer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InteractionService {

    private final CoursRepository coursRepository;
    private final LikeRepository        likeRepository;
    private final CommentaireRepository commentaireRepository;
    private final NoteRepository        noteRepository;
    private final EventProducer         eventProducer;

    // ── Résumé complet ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public InteractionCoursDTO getInteractions(Long coursId) {
        Long userId = JwtUtil.getCurrentUserId();
        Cours cours = findCours(coursId);

        InteractionCoursDTO dto = new InteractionCoursDTO();
        dto.setCoursId(coursId);
        dto.setTotalLikes(likeRepository.countByCoursIdCours(coursId));
        dto.setUserALike(userId != null && likeRepository.existsByCoursIdCoursAndUserId(coursId, userId));

        Optional<Note> myNote = userId != null ? noteRepository.findByCoursIdCoursAndUserId(coursId, userId) : Optional.empty();
        dto.setNoteUtilisateur(myNote.map(Note::getValeur).orElse(null));
        dto.setMoyenneNotes(noteRepository.findAverageByCoursId(coursId));
        dto.setTotalNotes(noteRepository.countByCoursIdCours(coursId));

        dto.setCommentaires(commentaireRepository
                .findByCoursIdCoursOrderByDateCreationDesc(coursId)
                .stream().map(this::toCommentaireDTO).toList());

        return dto;
    }

    // ── Like ──────────────────────────────────────────────────────────────────

    @Transactional
    public LikeResponseDTO toggleLike(Long coursId) {
        Long userId = requireUserId();
        Cours cours = findCours(coursId);

        Optional<Like> existing = likeRepository.findByCoursIdCoursAndUserId(coursId, userId);
        boolean liked;
        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            liked = false;
        } else {
            likeRepository.save(Like.builder().cours(cours).userId(userId).build());
            liked = true;
            // Kafka → notifier l'enseignant
            sendInteractionEvent(cours, userId, "LIKE",
                    "Un apprenant a aimé votre cours : " + cours.getTitre());
        }
        return new LikeResponseDTO(coursId, liked, likeRepository.countByCoursIdCours(coursId));
    }

    // ── Note ──────────────────────────────────────────────────────────────────

    @Transactional
    public NoteResponseDTO noterCours(Long coursId, Integer valeur) {
        Long userId = requireUserId();
        Cours cours = findCours(coursId);

        Note note = noteRepository.findByCoursIdCoursAndUserId(coursId, userId)
                .orElse(Note.builder().cours(cours).userId(userId).build());
        note.setValeur(valeur);
        noteRepository.save(note);

        // Kafka → notifier l'enseignant
        sendInteractionEvent(cours, userId, "NOTE",
                "Un apprenant a noté votre cours \"" + cours.getTitre() + "\" : " + valeur + "/5");

        return new NoteResponseDTO(
                coursId, valeur,
                noteRepository.findAverageByCoursId(coursId),
                noteRepository.countByCoursIdCours(coursId));
    }

    // ── Commentaires ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CommentaireDTO> getCommentaires(Long coursId) {
        return commentaireRepository
                .findByCoursIdCoursOrderByDateCreationDesc(coursId)
                .stream().map(this::toCommentaireDTO).toList();
    }

    @Transactional
    public CommentaireDTO ajouterCommentaire(Long coursId, String contenu, String auteurNom) {
        Long userId = requireUserId();
        Cours cours = findCours(coursId);

        Commentaire c = Commentaire.builder()
                .cours(cours)
                .auteurId(userId)
                .auteurNom(auteurNom != null ? auteurNom : "Anonyme")
                .contenu(contenu.trim())
                .build();
        Commentaire saved = commentaireRepository.save(c);

        // Kafka → notifier l'enseignant
        sendInteractionEvent(cours, userId, "COMMENTAIRE",
                "Nouveau commentaire sur votre cours \"" + cours.getTitre() + "\" : " + contenu);

        return toCommentaireDTO(saved);
    }

    @Transactional
    public void supprimerCommentaire(Long coursId, Long commentaireId) {
        Long userId = requireUserId();
        Commentaire c = commentaireRepository.findById(commentaireId)
                .orElseThrow(() -> new ResourceNotFoundException("Commentaire introuvable : " + commentaireId));

        // Seul l'auteur ou un admin peut supprimer
        if (!JwtUtil.isAdmin() && !c.getAuteurId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Non autorisé.");
        }
        commentaireRepository.delete(c);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Cours findCours(Long coursId) {
        return coursRepository.findById(coursId)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable : " + coursId));
    }

    private Long requireUserId() {
        Long id = JwtUtil.getCurrentUserId();
        if (id == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non authentifié.");
        return id;
    }

    private void sendInteractionEvent(Cours cours, Long studentId, String type, String message) {
        try {
            eventProducer.sendCourseInteraction(new CourseInteractionEvent(
                    cours.getIdCours(),
                    cours.getEnseignantId(),
                    studentId,
                    type,
                    message
            ));
        } catch (Exception e) {
            // Ne pas bloquer l'opération si Kafka est down
        }
    }

    private CommentaireDTO toCommentaireDTO(Commentaire c) {
        CommentaireDTO dto = new CommentaireDTO();
        dto.setId(c.getId());
        dto.setCoursId(c.getCours().getIdCours());
        dto.setAuteurId(c.getAuteurId());
        dto.setAuteurNom(c.getAuteurNom());
        dto.setContenu(c.getContenu());
        dto.setDateCreation(c.getDateCreation());
        return dto;
    }
}
