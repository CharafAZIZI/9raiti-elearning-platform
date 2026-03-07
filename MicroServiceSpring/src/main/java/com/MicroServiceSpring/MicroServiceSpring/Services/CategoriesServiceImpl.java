package com.MicroServiceSpring.MicroServiceSpring.Services;
import com.MicroServiceSpring.MicroServiceSpring.DTO.CategoriesDTO;
import com.MicroServiceSpring.MicroServiceSpring.Mappers.CategoriesMapper;
import com.MicroServiceSpring.MicroServiceSpring.Models.Categories;
import com.MicroServiceSpring.MicroServiceSpring.Repository.CategoriesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriesServiceImpl implements CategoriesService {

    private final CategoriesRepository categoriesRepository;
    private final CategoriesMapper categoriesMapper;

    @Override
    public CategoriesDTO createCategory(CategoriesDTO dto) {

        if(categoriesRepository.existsByNom(dto.getNom())){
            throw new RuntimeException("Category déjà existante");
        }

        Categories categories = categoriesMapper.toEntity(dto);

        return categoriesMapper.toDTO(categoriesRepository.save(categories));
    }

    @Override
    public List<CategoriesDTO> getAllCategories() {

        return categoriesRepository.findAll()
                .stream()
                .map(categoriesMapper::toDTO)
                .toList();
    }

    @Override
    public CategoriesDTO getCategoryById(Long id) {

        Categories categories = categoriesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category introuvable"));

        return categoriesMapper.toDTO(categories);
    }

    @Override
    public CategoriesDTO updateCategory(Long id, CategoriesDTO dto) {

        Categories category = categoriesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category introuvable"));

        category.setNom(dto.getNom());
        category.setDescription(dto.getDescription());

        return categoriesMapper.toDTO(categoriesRepository.save(category));
    }

    @Override
    public void deleteCategory(Long id) {

        if(!categoriesRepository.existsById(id)){
            throw new RuntimeException("Category introuvable");
        }

        categoriesRepository.deleteById(id);
    }
}