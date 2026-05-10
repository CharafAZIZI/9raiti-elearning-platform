package com.MicroServiceSpring.MicroServiceSpring.Controllers;

import com.MicroServiceSpring.MicroServiceSpring.DTO.Modules.ApprenantInscritDTO;
import com.MicroServiceSpring.MicroServiceSpring.DTO.Modules.InscriptionDTO;
import com.MicroServiceSpring.MicroServiceSpring.Services.Inscriptions.IInscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Endpoints inscription apprenant ↔ module.
 *
 * ── APPRENANT ──────────────────────────────────────────────────────────────
 * POST   /api/inscriptions/{moduleId}              → s'inscrire
 * DELETE /api/inscriptions/{moduleId}              → se désinscrire
 * GET    /api/inscriptions/mes-inscriptions        → historique apprenant connecté
 * GET    /api/inscriptions/status/{moduleId}       → {inscrit: true|false}
 *
 * ── ENSEIGNANT ─────────────────────────────────────────────────────────────
 * GET    /api/inscriptions/module/{moduleId}/apprenants  → apprenants d'un module
 * GET    /api/inscriptions/mes-apprenants                → tous mes apprenants
 */
@RestController
@RequestMapping("/api/inscriptions")
@RequiredArgsConstructor
public class InscriptionController {

    private final IInscriptionService inscriptionService;

    // ── APPRENANT ─────────────────────────────────────────────────────────────

    @PostMapping("/{moduleId}")
    public ResponseEntity<InscriptionDTO> inscrire(@PathVariable Long moduleId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(inscriptionService.inscrire(moduleId));
    }

    @DeleteMapping("/{moduleId}")
    public ResponseEntity<Void> desinscrire(@PathVariable Long moduleId) {
        inscriptionService.desinscrire(moduleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/mes-inscriptions")
    public ResponseEntity<List<InscriptionDTO>> getMesInscriptions() {
        return ResponseEntity.ok(inscriptionService.getMesInscriptions());
    }

    @GetMapping("/status/{moduleId}")
    public ResponseEntity<Map<String, Boolean>> estInscrit(@PathVariable Long moduleId) {
        return ResponseEntity.ok(Map.of("inscrit", inscriptionService.estInscrit(moduleId)));
    }

    // ── ENSEIGNANT ────────────────────────────────────────────────────────────

    /** Apprenants inscrits à un module spécifique (propriétaire ou admin) */
    @GetMapping("/module/{moduleId}/apprenants")
    public ResponseEntity<List<ApprenantInscritDTO>> getApprenantsDuModule(
            @PathVariable Long moduleId) {
        return ResponseEntity.ok(inscriptionService.getApprenantsDuModule(moduleId));
    }

    /** Tous les apprenants inscrits aux modules de l'enseignant connecté */
    @GetMapping("/mes-apprenants")
    public ResponseEntity<List<ApprenantInscritDTO>> getMesApprenants() {
        return ResponseEntity.ok(inscriptionService.getMesApprenants());
    }
}
