package com.MicroServiceSpring.MicroServiceSpring.Repository.Quiz;

import com.MicroServiceSpring.MicroServiceSpring.Models.Quiz.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByEnseignantId(Long enseignantId);
    List<Quiz> findByCoursIdAndActifTrue(Long coursId);
    List<Quiz> findByCoursId(Long coursId);
}
