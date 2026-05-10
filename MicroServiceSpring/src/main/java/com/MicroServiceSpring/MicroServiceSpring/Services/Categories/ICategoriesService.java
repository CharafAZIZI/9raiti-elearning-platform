package com.MicroServiceSpring.MicroServiceSpring.Services.Categories;

import com.MicroServiceSpring.MicroServiceSpring.DTO.Categories.CategoriesDTO;

import java.util.List;

public interface ICategoriesService {

    CategoriesDTO createCategory(CategoriesDTO dto);
    List<CategoriesDTO> getAllCategories();
    CategoriesDTO getCategoryById(Long id);
    CategoriesDTO updateCategory(Long id, CategoriesDTO dto);
    void deleteCategory(Long id);
}
