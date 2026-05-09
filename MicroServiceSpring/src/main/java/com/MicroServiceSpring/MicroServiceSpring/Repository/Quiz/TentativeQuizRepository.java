package com.MicroServiceSpring.MicroServiceSpring.Repository.Quiz;

import com.MicroServiceSpring.MicroServiceSpring.Models.Quiz.TentativeQuiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TentativeQuizRepository extends JpaRepository<TentativeQuiz, Long> {
    List<TentativeQuiz> findByUtilisateurIdOrderByDateTentativeDesc(Long utilisateurId);
    List<TentativeQuiz> findByQuizIdOrderByDateTentativeDesc(Long quizId);
}
