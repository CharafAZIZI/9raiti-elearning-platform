package com.MicroServiceSpring.MicroServiceSpring.Repository.Cours;

import com.MicroServiceSpring.MicroServiceSpring.Models.Cours.Cours;
import com.MicroServiceSpring.MicroServiceSpring.Models.Cours.StatutCours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CoursRepository extends JpaRepository<Cours, Long> {

    List<Cours> findByModuleId(Long moduleId);

    List<Cours> findByStatut(StatutCours statut);

    /** Cours appartenant à un enseignant donné */
    List<Cours> findByEnseignantId(Long enseignantId);

    /** Sécuriser update/delete : cours doit appartenir à l'enseignant */
    Optional<Cours> findByIdCoursAndEnseignantId(Long idCours, Long enseignantId);
}
