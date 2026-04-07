package com.MicroServiceSpring.MicroServiceSpring.Mappers;

import com.MicroServiceSpring.MicroServiceSpring.DTO.CoursDTO;
import com.MicroServiceSpring.MicroServiceSpring.Models.Cours;
import com.MicroServiceSpring.MicroServiceSpring.Models.Module;
import org.springframework.stereotype.Component;

@Component
public class CoursMapper {

    public CoursDTO toDTO(Cours cours) {

        CoursDTO dto = new CoursDTO();
        dto.setIdCours(cours.getIdCours());
        dto.setTitre(cours.getTitre());
        dto.setDescription(cours.getDescription());
        dto.setNiveau(cours.getNiveau());
        dto.setDateCreation(cours.getDateCreation());
        dto.setNombreInscrits(cours.getNombreInscrits());
        dto.setFilePath(cours.getFilePath());

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
        cours.setNombreInscrits(dto.getNombreInscrits());
        cours.setFilePath(dto.getFilePath());
        cours.setModule(module);

        return cours;
    }

    public void updateEntityFromDTO(CoursDTO dto, Cours cours, Module module) {

        cours.setTitre(dto.getTitre());
        cours.setDescription(dto.getDescription());
        cours.setNiveau(dto.getNiveau());
        cours.setNombreInscrits(dto.getNombreInscrits());
        cours.setFilePath(dto.getFilePath());
        cours.setModule(module);
    }
}