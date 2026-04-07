package com.MicroServiceSpring.MicroServiceSpring.Services;

import com.MicroServiceSpring.MicroServiceSpring.DTO.CategoriesDTO;

import java.util.List;

public interface CategoriesService {

    CategoriesDTO createCategory(CategoriesDTO dto);
    List<CategoriesDTO> getAllCategories();
    CategoriesDTO getCategoryById(Long id);
    CategoriesDTO updateCategory(Long id, CategoriesDTO dto);
    void deleteCategory(Long id);
}
