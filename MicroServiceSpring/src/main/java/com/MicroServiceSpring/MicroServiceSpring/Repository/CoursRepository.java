package com.MicroServiceSpring.MicroServiceSpring.Repository;

import com.MicroServiceSpring.MicroServiceSpring.Models.Cours;
import com.MicroServiceSpring.MicroServiceSpring.Models.StatutCours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoursRepository extends JpaRepository<Cours, Long> {

    List<Cours> findByModuleId(Long moduleId);

    // CORRECTION : statut est un enum, pas un String
    List<Cours> findByStatut(StatutCours statut);
}
