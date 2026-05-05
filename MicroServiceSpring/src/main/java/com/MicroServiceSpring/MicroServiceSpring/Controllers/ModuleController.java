package com.MicroServiceSpring.MicroServiceSpring.Controllers;

import com.MicroServiceSpring.MicroServiceSpring.DTO.Modules.ModuleDTO;
import com.MicroServiceSpring.MicroServiceSpring.Security.JwtUtil;
import com.MicroServiceSpring.MicroServiceSpring.Services.Modules.ModuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleService moduleService;

    /** Création — enseignantId injecté depuis le JWT */
    @PostMapping
    public ResponseEntity<ModuleDTO> create(@Valid @RequestBody ModuleDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(moduleService.createModule(dto));
    }

    /** Lecture publique — tous les modules (avec enseignantId) */
    @GetMapping
    public ResponseEntity<List<ModuleDTO>> getAll() {
        return ResponseEntity.ok(moduleService.getAllModules());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ModuleDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(moduleService.getModuleById(id));
    }

    /** Lecture publique — modules d'une catégorie (tous enseignants visibles) */
    @GetMapping("/categorie/{categorieId}")
    public ResponseEntity<List<ModuleDTO>> getByCategorieId(@PathVariable Long categorieId) {
        return ResponseEntity.ok(moduleService.getModulesByCategorieId(categorieId));
    }

    /**
     * Modules appartenant à l'enseignant connecté.
     * Utilisé par le dashboard enseignant pour charger son propre contenu CRUD.
     */
    @GetMapping("/mes-modules")
    public ResponseEntity<List<ModuleDTO>> getMesModules() {
        Long enseignantId = JwtUtil.getCurrentUserId();
        if (enseignantId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur non authentifié.");
        }
        return ResponseEntity.ok(moduleService.getModulesByEnseignantId(enseignantId));
    }

    /** Mise à jour — vérifie ownership côté service */
    @PutMapping("/{id}")
    public ResponseEntity<ModuleDTO> update(@PathVariable Long id, @Valid @RequestBody ModuleDTO dto) {
        return ResponseEntity.ok(moduleService.updateModule(id, dto));
    }

    /** Suppression — vérifie ownership côté service */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        moduleService.deleteModule(id);
        return ResponseEntity.noContent().build();
    }
}
