package com.MicroServiceSpring.MicroServiceSpring.Repository;

import com.MicroServiceSpring.MicroServiceSpring.Models.Cours;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoursRepository extends JpaRepository<Cours, Long> {
    // Interface pour accéder à la table "cours" (CRUD + requêtes JPA)
}
