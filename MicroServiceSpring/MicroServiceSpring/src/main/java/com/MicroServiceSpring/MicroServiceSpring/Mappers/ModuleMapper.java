package com.MicroServiceSpring.MicroServiceSpring.Mappers;

import com.MicroServiceSpring.MicroServiceSpring.DTO.ModuleDTO;
import com.MicroServiceSpring.MicroServiceSpring.Models.Module;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ModuleMapper {

    private final CoursMapper coursMapper;

    public ModuleMapper(CoursMapper coursMapper) {
        this.coursMapper = coursMapper;
    }

    public ModuleDTO toDTO(Module module) {

        ModuleDTO dto = new ModuleDTO();
        dto.setId(module.getId());
        dto.setNom(module.getNom());
        dto.setDescription(module.getDescription());
        dto.setCode(module.getCode());
        dto.setActif(module.isActif());

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

        return module;
    }

    public void updateEntityFromDTO(ModuleDTO dto, Module module) {

        module.setNom(dto.getNom());
        module.setDescription(dto.getDescription());
        module.setActif(dto.isActif());
    }
}