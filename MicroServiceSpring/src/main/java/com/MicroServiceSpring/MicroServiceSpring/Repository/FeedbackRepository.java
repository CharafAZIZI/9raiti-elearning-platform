package com.MicroServiceSpring.MicroServiceSpring.Repository;
import com.MicroServiceSpring.MicroServiceSpring.Models.Feedback;
import com.MicroServiceSpring.MicroServiceSpring.Models.StatutFeedback;
import com.MicroServiceSpring.MicroServiceSpring.Models.TypeAvis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    // Admin : tous les feedbacks par type
    List<Feedback> findByTypeAvis(TypeAvis typeAvis);

    // Admin : tous les feedbacks par statut
    List<Feedback> findByStatut(StatutFeedback statut);

    // Enseignant : avis sur ses cours (par coursId)
    List<Feedback> findByCoursId(Long coursId);

    // Historique d'un utilisateur (par email)
    List<Feedback> findByEmail(String email);

    // Admin : feedbacks par type ET statut (filtres combinés)
    List<Feedback> findByTypeAvisAndStatut(TypeAvis typeAvis, StatutFeedback statut);
    // Ajouter cette méthode dans l'interface
    List<Feedback> findByEmailOrderByDateCreationDesc(String email);
}
