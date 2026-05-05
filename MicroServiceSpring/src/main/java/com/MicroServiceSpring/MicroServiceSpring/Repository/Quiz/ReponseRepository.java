package com.MicroServiceSpring.MicroServiceSpring.Repository.Quiz;

import com.MicroServiceSpring.MicroServiceSpring.Models.Quiz.Reponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReponseRepository extends JpaRepository<Reponse, Long> {}
