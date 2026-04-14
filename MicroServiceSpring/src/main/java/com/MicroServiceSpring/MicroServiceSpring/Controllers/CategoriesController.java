package com.MicroServiceSpring.MicroServiceSpring.Controllers;

import com.MicroServiceSpring.MicroServiceSpring.DTO.CategoriesDTO;
import com.MicroServiceSpring.MicroServiceSpring.Services.Categories.CategoriesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoriesController {

    private final CategoriesService categoriesService;

    @PostMapping
    public ResponseEntity<CategoriesDTO> create(@Valid @RequestBody CategoriesDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoriesService.createCategory(dto));
    }

    @GetMapping
    public ResponseEntity<List<CategoriesDTO>> getAll() {
        return ResponseEntity.ok(categoriesService.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriesDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(categoriesService.getCategoryById(id));
    }

    // CORRECTION : @Valid ajouté sur le PUT (manquait dans l'original)
    @PutMapping("/{id}")
    public ResponseEntity<CategoriesDTO> update(@PathVariable Long id,
                                                @Valid @RequestBody CategoriesDTO dto) {
        return ResponseEntity.ok(categoriesService.updateCategory(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoriesService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
