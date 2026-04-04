package com.MicroServiceSpring.MicroServiceSpring.Services;

import com.MicroServiceSpring.MicroServiceSpring.DTO.CategoriesDTO;
import com.MicroServiceSpring.MicroServiceSpring.Exceptions.ConflictException;
import com.MicroServiceSpring.MicroServiceSpring.Exceptions.ResourceNotFoundException;
import com.MicroServiceSpring.MicroServiceSpring.Mappers.CategoriesMapper;
import com.MicroServiceSpring.MicroServiceSpring.Models.Categories;
import com.MicroServiceSpring.MicroServiceSpring.Repository.CategoriesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriesServiceImpl implements CategoriesService {

    private final CategoriesRepository categoriesRepository;
    private final CategoriesMapper categoriesMapper;

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

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        if (!categoriesRepository.existsById(id)) {
            throw new ResourceNotFoundException("Catégorie introuvable avec l'id : " + id);
        }
        categoriesRepository.deleteById(id);
    }
}
