package com.MicroServiceSpring.MicroServiceSpring.Repository.Modules;

import com.MicroServiceSpring.MicroServiceSpring.Models.Modules.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {

    boolean existsByCode(String code);

    List<Module> findByCategorie_Id(Long categorieId);

    /** Modules appartenant à un enseignant donné */
    List<Module> findByEnseignantId(Long enseignantId);

    /** Sécuriser update/delete : module doit appartenir à l'enseignant */
    Optional<Module> findByIdAndEnseignantId(Long id, Long enseignantId);

    void deleteByCategorieId(Long categorieId);
}
