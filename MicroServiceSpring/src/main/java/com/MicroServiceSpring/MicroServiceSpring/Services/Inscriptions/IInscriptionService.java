package com.MicroServiceSpring.MicroServiceSpring.Services.Inscriptions;

import com.MicroServiceSpring.MicroServiceSpring.DTO.Modules.ApprenantInscritDTO;
import com.MicroServiceSpring.MicroServiceSpring.DTO.Modules.InscriptionDTO;

import java.util.List;

public interface IInscriptionService {

    // ── Côté APPRENANT ────────────────────────────────────────────────────────

    /** Inscrit l'apprenant connecté au module donné */
    InscriptionDTO inscrire(Long moduleId);

    /** Désinscrit l'apprenant connecté du module donné */
    void desinscrire(Long moduleId);

    /** Retourne toutes les inscriptions de l'apprenant connecté */
    List<InscriptionDTO> getMesInscriptions();

    /** Vérifie si l'apprenant connecté est inscrit à ce module */
    boolean estInscrit(Long moduleId);

    // ── Côté ENSEIGNANT ───────────────────────────────────────────────────────

    /**
     * Retourne tous les apprenants inscrits à UN module donné.
     * Accessible uniquement à l'enseignant propriétaire du module (ou admin).
     */
    List<ApprenantInscritDTO> getApprenantsDuModule(Long moduleId);

    /**
     * Retourne tous les apprenants inscrits à TOUS les modules
     * de l'enseignant connecté.
     */
    List<ApprenantInscritDTO> getMesApprenants();
}
