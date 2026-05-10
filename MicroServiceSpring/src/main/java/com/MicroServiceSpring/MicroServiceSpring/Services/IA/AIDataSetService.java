package com.MicroServiceSpring.MicroServiceSpring.Services.IA;

import com.MicroServiceSpring.MicroServiceSpring.DTO.IA.RecommendationDatasetDTO;
import com.MicroServiceSpring.MicroServiceSpring.Models.Interaction.Commentaire;
import com.MicroServiceSpring.MicroServiceSpring.Models.Interaction.Like;
import com.MicroServiceSpring.MicroServiceSpring.Models.Interaction.Note;
import com.MicroServiceSpring.MicroServiceSpring.Repository.Interaction.CommentaireRepository;
import com.MicroServiceSpring.MicroServiceSpring.Repository.Interaction.LikeRepository;
import com.MicroServiceSpring.MicroServiceSpring.Repository.Interaction.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AIDataSetService implements IAIDataSetService {

    private final LikeRepository likeRepository;
    private final NoteRepository noteRepository;
    private final CommentaireRepository commentaireRepository;

    @Override
    public List<RecommendationDatasetDTO> buildDataset() {

        Map<String, Double> scores = new HashMap<>();

        addLikes(scores);
        addNotes(scores);
        addCommentaires(scores);

        return convertToDTO(scores);
    }

    // =========================
    // LIKES
    // =========================
    private void addLikes(Map<String, Double> scores) {

        for (Like like : likeRepository.findAll()) {

            String key = buildKey(
                    like.getUserId(),
                    like.getCours().getId()
            );

            scores.put(key,
                    scores.getOrDefault(key, 0.0) + 3
            );
        }
    }

    // =========================
    // NOTES
    // =========================
    private void addNotes(Map<String, Double> scores) {

        for (Note note : noteRepository.findAll()) {

            String key = buildKey(
                    note.getUserId(),
                    note.getCours().getId()
            );

            scores.put(key,
                    scores.getOrDefault(key, 0.0)
                            + note.getValeur()
            );
        }
    }

    // =========================
    // COMMENTAIRES
    // =========================
    private void addCommentaires(Map<String, Double> scores) {

        for (Commentaire c : commentaireRepository.findAll()) {

            String key = buildKey(
                    c.getAuteurId(),
                    c.getCours().getId()
            );

            scores.put(key,
                    scores.getOrDefault(key, 0.0) + 2
            );
        }
    }

    // =========================
    // CONVERSION FINAL
    // =========================
    private List<RecommendationDatasetDTO> convertToDTO(
            Map<String, Double> scores
    ) {

        List<RecommendationDatasetDTO> dataset = new ArrayList<>();

        for (Map.Entry<String, Double> entry : scores.entrySet()) {

            String[] parts = entry.getKey().split("-");

            dataset.add(
                    RecommendationDatasetDTO.builder()
                            .userId(Long.parseLong(parts[0]))
                            .coursId(Long.parseLong(parts[1]))
                            .score(entry.getValue())
                            .build()
            );
        }

        return dataset;
    }

    // =========================
    // KEY BUILDER
    // =========================
    private String buildKey(Long userId, Long coursId) {
        return userId + "-" + coursId;
    }
}