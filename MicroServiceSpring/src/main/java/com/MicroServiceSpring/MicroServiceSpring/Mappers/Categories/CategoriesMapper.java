package com.MicroServiceSpring.MicroServiceSpring.Mappers.Categories;

import com.MicroServiceSpring.MicroServiceSpring.DTO.Categories.CategoriesDTO;
import com.MicroServiceSpring.MicroServiceSpring.Models.Cetagories.Categories;
import org.springframework.stereotype.Component;

@Component
public class CategoriesMapper {

    public CategoriesDTO toDTO(Categories categorie) {
        CategoriesDTO dto = new CategoriesDTO();
        dto.setId(categorie.getId());
        dto.setNom(categorie.getNom());
        dto.setDescription(categorie.getDescription());
        return dto;
    }

    public Categories toEntity(CategoriesDTO dto) {
        Categories categorie = new Categories();
        categorie.setNom(dto.getNom());
        categorie.setDescription(dto.getDescription());
        return categorie;
    }
}
