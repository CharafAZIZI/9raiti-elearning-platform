package com.MicroServiceSpring.MicroServiceSpring.Repository.Categories;

import com.MicroServiceSpring.MicroServiceSpring.Models.Cetagories.Categories;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoriesRepository extends JpaRepository<Categories, Long> {
    boolean existsByNom(String nom);
}
