package com.MicroServiceSpring.MicroServiceSpring.Repository.Quiz;

import com.MicroServiceSpring.MicroServiceSpring.Models.Quiz.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {}
