package com.MicroServiceSpring.MicroServiceSpring.Repository;

import com.MicroServiceSpring.MicroServiceSpring.Models.Interaction.Commentaire;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentaireRepository extends JpaRepository<Commentaire, Long> {
    List<Commentaire> findByCoursIdCoursOrderByDateCreationDesc(Long coursId);
}
