package com.MicroServiceSpring.MicroServiceSpring.Mappers;

import com.MicroServiceSpring.MicroServiceSpring.DTO.ModuleDTO;
import com.MicroServiceSpring.MicroServiceSpring.Exceptions.ResourceNotFoundException;
import com.MicroServiceSpring.MicroServiceSpring.Models.Cetagories.Categories;
import com.MicroServiceSpring.MicroServiceSpring.Models.Modules.Module;
import com.MicroServiceSpring.MicroServiceSpring.Repository.CategoriesRepository;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ModuleMapper {

    private final CoursMapper coursMapper;
    private final CategoriesRepository categoriesRepository;

    public ModuleMapper(CoursMapper coursMapper, CategoriesRepository categoriesRepository) {
        this.coursMapper = coursMapper;
        this.categoriesRepository = categoriesRepository;
    }

    public ModuleDTO toDTO(Module module) {
        ModuleDTO dto = new ModuleDTO();
        dto.setId(module.getId());
        dto.setNom(module.getNom());
        dto.setDescription(module.getDescription());
        dto.setCode(module.getCode());
        dto.setActif(module.isActif());
        dto.setEnseignantId(module.getEnseignantId()); // ← propriétaire
        if (module.getCategorie() != null) {
            dto.setCategorieId(module.getCategorie().getId());
        }
        if (module.getCours() != null) {
            dto.setCours(
                module.getCours()
                      .stream()
                      .map(coursMapper::toDTO)
                      .collect(Collectors.toList())
            );
        }
        return dto;
    }

    public Module toEntity(ModuleDTO dto) {
        Module module = new Module();
        module.setNom(dto.getNom());
        module.setDescription(dto.getDescription());
        module.setCode(dto.getCode());
        module.setActif(dto.isActif());
        // enseignantId est injecté par le service, pas par le DTO entrant
        if (dto.getCategorieId() != null) {
            Categories categorie = categoriesRepository.findById(dto.getCategorieId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Catégorie introuvable avec l'id : " + dto.getCategorieId()));
            module.setCategorie(categorie);
        }
        return module;
    }

    public void updateEntityFromDTO(ModuleDTO dto, Module module) {
        module.setNom(dto.getNom());
        module.setDescription(dto.getDescription());
        module.setActif(dto.isActif());
        if (dto.getCategorieId() != null) {
            Categories categorie = categoriesRepository.findById(dto.getCategorieId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Catégorie introuvable avec l'id : " + dto.getCategorieId()));
            module.setCategorie(categorie);
        }
    }
}
