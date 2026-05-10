package com.MicroServiceSpring.MicroServiceSpring.Repository;

import com.MicroServiceSpring.MicroServiceSpring.Models.Interaction.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {
    boolean existsByCoursIdCoursAndUserId(Long coursId, Long userId);
    Optional<Like> findByCoursIdCoursAndUserId(Long coursId, Long userId);
    long countByCoursIdCours(Long coursId);
}
