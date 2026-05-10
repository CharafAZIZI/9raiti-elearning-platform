package com.MicroServiceSpring.MicroServiceSpring.Repository;

import com.MicroServiceSpring.MicroServiceSpring.Models.Interaction.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface NoteRepository extends JpaRepository<Note, Long> {
    Optional<Note> findByCoursIdCoursAndUserId(Long coursId, Long userId);
    long countByCoursIdCours(Long coursId);
    @Query("SELECT AVG(n.valeur) FROM Note n WHERE n.cours.idCours = :coursId")
    Double findAverageByCoursId(Long coursId);
}
