package com.MicroServiceSpring.MicroServiceSpring.Repository;

import com.MicroServiceSpring.MicroServiceSpring.Models.Categories;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriesRepository extends JpaRepository<Categories, Long> {
    boolean existsByNom(String nom);
}