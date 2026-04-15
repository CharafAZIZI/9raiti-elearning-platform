package com.MicroServiceSpring.MicroServiceSpring.Controllers;

import com.MicroServiceSpring.MicroServiceSpring.DTO.ModuleDTO;
import com.MicroServiceSpring.MicroServiceSpring.Services.Modules.ModuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleService moduleService;

    @PostMapping
    public ResponseEntity<ModuleDTO> create(@Valid @RequestBody ModuleDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(moduleService.createModule(dto));
    }

    @GetMapping
    public ResponseEntity<List<ModuleDTO>> getAll() {
        return ResponseEntity.ok(moduleService.getAllModules());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ModuleDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(moduleService.getModuleById(id));
    }

    @GetMapping("/categorie/{categorieId}")
    public ResponseEntity<List<ModuleDTO>> getByCategorieId(@PathVariable Long categorieId) {
        return ResponseEntity.ok(moduleService.getModulesByCategorieId(categorieId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ModuleDTO> update(@PathVariable Long id,
                                            @Valid @RequestBody ModuleDTO dto) {
        return ResponseEntity.ok(moduleService.updateModule(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        moduleService.deleteModule(id);
        return ResponseEntity.noContent().build();
    }
}
