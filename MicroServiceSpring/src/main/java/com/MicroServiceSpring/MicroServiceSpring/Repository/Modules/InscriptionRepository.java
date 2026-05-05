package com.MicroServiceSpring.MicroServiceSpring.Repository.Modules;

import com.MicroServiceSpring.MicroServiceSpring.Models.Inscriptions.Inscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InscriptionRepository extends JpaRepository<Inscription, Long> {

    /** Toutes les inscriptions d'un apprenant donné */
    List<Inscription> findByApprenantId(Long apprenantId);

    /** Vérifie si l'apprenant est déjà inscrit à ce module */
    boolean existsByApprenantIdAndModuleId(Long apprenantId, Long moduleId);

    /** Retrouve l'inscription précise apprenant + module */
    Optional<Inscription> findByApprenantIdAndModuleId(Long apprenantId, Long moduleId);

    /** Nombre d'inscrits pour un module donné */
    long countByModuleId(Long moduleId);

    /**
     * Toutes les inscriptions d'un module donné
     * (utilisé par l'enseignant pour voir ses apprenants)
     */
    List<Inscription> findByModuleId(Long moduleId);

    /**
     * Toutes les inscriptions pour l'ensemble des modules d'un enseignant.
     * Utile pour afficher "tous mes apprenants" en une seule requête.
     */
    @Query("""
        SELECT i FROM Inscription i
        WHERE i.module.enseignantId = :enseignantId
        ORDER BY i.dateInscription DESC
    """)
    List<Inscription> findByEnseignantId(@Param("enseignantId") Long enseignantId);
}
