package com.MicroServiceSpring.MicroServiceSpring.Mappers.Cours;

import com.MicroServiceSpring.MicroServiceSpring.DTO.Cours.CoursDTO;
import com.MicroServiceSpring.MicroServiceSpring.Models.Cours.Cours;
import com.MicroServiceSpring.MicroServiceSpring.Models.Modules.Module;
import org.springframework.stereotype.Component;

@Component
public class CoursMapper {

    public CoursDTO toDTO(Cours cours) {
        CoursDTO dto = new CoursDTO();
        dto.setIdCours(cours.getIdCours());
        dto.setTitre(cours.getTitre());
        dto.setDescription(cours.getDescription());
        dto.setNiveau(cours.getNiveau());
        dto.setStatut(cours.getStatut());
        dto.setDateCreation(cours.getDateCreation());
        dto.setDureeMinutes(cours.getDureeMinutes());
        dto.setFilePath(cours.getFilePath());
        dto.setEnseignantId(cours.getEnseignantId()); // ← propriétaire
        if (cours.getModule() != null) {
            dto.setModuleId(cours.getModule().getId());
        }
        return dto;
    }

    public Cours toEntity(CoursDTO dto, Module module) {
        Cours cours = new Cours();
        cours.setTitre(dto.getTitre());
        cours.setDescription(dto.getDescription());
        cours.setNiveau(dto.getNiveau());
        cours.setStatut(dto.getStatut());
        cours.setDureeMinutes(dto.getDureeMinutes());
        cours.setFilePath(dto.getFilePath());
        cours.setModule(module);
        // enseignantId est injecté par le service
        return cours;
    }

    public void updateEntityFromDTO(CoursDTO dto, Cours cours, Module module) {
        cours.setTitre(dto.getTitre());
        cours.setDescription(dto.getDescription());
        cours.setNiveau(dto.getNiveau());
        cours.setStatut(dto.getStatut());
        cours.setDureeMinutes(dto.getDureeMinutes());
        cours.setFilePath(dto.getFilePath());
        cours.setModule(module);
        // On ne touche pas à enseignantId lors d'une mise à jour
    }
}
