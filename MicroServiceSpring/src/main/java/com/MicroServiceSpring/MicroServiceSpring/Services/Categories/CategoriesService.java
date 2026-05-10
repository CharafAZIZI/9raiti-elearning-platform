package com.MicroServiceSpring.MicroServiceSpring.Services.Categories;

import com.MicroServiceSpring.MicroServiceSpring.DTO.Categories.CategoriesDTO;
import com.MicroServiceSpring.MicroServiceSpring.Exceptions.ConflictException;
import com.MicroServiceSpring.MicroServiceSpring.Exceptions.ResourceNotFoundException;
import com.MicroServiceSpring.MicroServiceSpring.Mappers.Categories.CategoriesMapper;
import com.MicroServiceSpring.MicroServiceSpring.Models.Cetagories.Categories;
import com.MicroServiceSpring.MicroServiceSpring.Repository.Categories.CategoriesRepository;
import com.MicroServiceSpring.MicroServiceSpring.Repository.Modules.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriesService implements ICategoriesService {

    private final CategoriesRepository categoriesRepository;
    private final CategoriesMapper categoriesMapper;
    private final ModuleRepository moduleRepository;

    @Override
    @Transactional
    public CategoriesDTO createCategory(CategoriesDTO dto) {
        if (categoriesRepository.existsByNom(dto.getNom())) {
            throw new ConflictException("Une catégorie avec le nom '" + dto.getNom() + "' existe déjà.");
        }
        Categories categories = categoriesMapper.toEntity(dto);
        return categoriesMapper.toDTO(categoriesRepository.save(categories));
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Categories category = categoriesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable avec l'id : " + id));

        // ✅ Supprimer les modules liés à cette catégorie d'abord
        moduleRepository.deleteByCategorieId(id);

        // ✅ Ensuite supprimer la catégorie
        categoriesRepository.delete(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoriesDTO> getAllCategories() {
        return categoriesRepository.findAll()
                .stream()
                .map(categoriesMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoriesDTO getCategoryById(Long id) {
        Categories categories = categoriesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable avec l'id : " + id));
        return categoriesMapper.toDTO(categories);
    }

    @Override
    @Transactional
    public CategoriesDTO updateCategory(Long id, CategoriesDTO dto) {
        Categories category = categoriesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable avec l'id : " + id));
        category.setNom(dto.getNom());
        category.setDescription(dto.getDescription());
        return categoriesMapper.toDTO(categoriesRepository.save(category));
    }
}
