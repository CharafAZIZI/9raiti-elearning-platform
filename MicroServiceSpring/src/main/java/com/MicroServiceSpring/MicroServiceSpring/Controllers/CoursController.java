package com.MicroServiceSpring.MicroServiceSpring.Controllers;

import com.MicroServiceSpring.MicroServiceSpring.DTO.CoursDTO;
import com.MicroServiceSpring.MicroServiceSpring.Security.JwtUtil;
import com.MicroServiceSpring.MicroServiceSpring.Services.Cours.CoursService;
import com.MicroServiceSpring.MicroServiceSpring.Services.Minio.MinioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cours")
@RequiredArgsConstructor
public class CoursController {

    private final CoursService coursService;
    private final MinioService minioService;

    // ── CRUD ──────────────────────────────────────────────────────────────────

    /** Création — enseignantId injecté depuis le JWT */
    @PostMapping
    public ResponseEntity<CoursDTO> create(@Valid @RequestBody CoursDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(coursService.createCours(dto));
    }

    /** Lecture publique — tous les cours */
    @GetMapping
    public ResponseEntity<List<CoursDTO>> getAll() {
        return ResponseEntity.ok(coursService.getAllCours());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CoursDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(coursService.getCoursById(id));
    }

    @GetMapping("/module/{moduleId}")
    public ResponseEntity<List<CoursDTO>> getByModuleId(@PathVariable Long moduleId) {
        return ResponseEntity.ok(coursService.getCoursByModuleId(moduleId));
    }

    @GetMapping("/publies")
    public ResponseEntity<List<CoursDTO>> getPublies() {
        return ResponseEntity.ok(coursService.getCoursPublies());
    }

    /**
     * Cours appartenant à l'enseignant connecté.
     * Utilisé par le dashboard enseignant pour charger son propre contenu CRUD.
     */
    @GetMapping("/mes-cours")
    public ResponseEntity<List<CoursDTO>> getMesCours() {
        Long enseignantId = JwtUtil.getCurrentUserId();
        if (enseignantId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur non authentifié.");
        }
        return ResponseEntity.ok(coursService.getCoursByEnseignantId(enseignantId));
    }

    /** Mise à jour — vérifie ownership côté service */
    @PutMapping("/{id}")
    public ResponseEntity<CoursDTO> update(@PathVariable Long id, @Valid @RequestBody CoursDTO dto) {
        return ResponseEntity.ok(coursService.updateCours(id, dto));
    }

    /** Suppression — vérifie ownership côté service + supprime le fichier MinIO */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        CoursDTO cours = coursService.getCoursById(id);
        if (cours.getFilePath() != null) {
            minioService.deleteFile(cours.getFilePath());
        }
        coursService.deleteCours(id);
        return ResponseEntity.noContent().build();
    }

    // ── MinIO : Upload ─────────────────────────────────────────────────────────

    @PostMapping("/{id}/upload")
    public ResponseEntity<Map<String, String>> uploadFile(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {

        validateFileType(file);
        CoursDTO existing = coursService.getCoursById(id);
        if (existing.getFilePath() != null) {
            minioService.deleteFile(existing.getFilePath());
        }
        String objectKey = minioService.uploadFile(file);
        coursService.updateFilePath(id, objectKey);
        return ResponseEntity.ok(Map.of("objectKey", objectKey, "message", "Fichier uploadé avec succès"));
    }

    // ── MinIO : URL pré-signée ─────────────────────────────────────────────────

    @GetMapping("/{id}/presigned-url")
    public ResponseEntity<Map<String, String>> getPresignedUrl(@PathVariable Long id) {
        CoursDTO cours = coursService.getCoursById(id);
        String filePath = cours.getFilePath();
        if (filePath == null || filePath.isBlank()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Aucun fichier associé à ce cours."));
        }
        String url  = minioService.generatePresignedUrl(filePath);
        String type = detectFileType(filePath);
        return ResponseEntity.ok(Map.of("url", url, "type", type, "objectKey", filePath));
    }

    // ── MinIO : Proxy download ─────────────────────────────────────────────────

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable Long id,
            @RequestParam(defaultValue = "inline") String mode) throws IOException {

        CoursDTO cours = coursService.getCoursById(id);
        String filePath = cours.getFilePath();
        if (filePath == null || filePath.isBlank()) return ResponseEntity.notFound().build();

        byte[]    data      = minioService.downloadFile(filePath);
        MediaType mediaType = resolveMediaType(filePath);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, mode + "; filename=\"" + extractFileName(filePath) + "\"")
            .contentType(mediaType)
            .body(data);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void validateFileType(MultipartFile file) {
        String ct = file.getContentType();
        if (ct == null || (!ct.equals("application/pdf") && !ct.startsWith("video/"))) {
            throw new IllegalArgumentException(
                "Type de fichier non supporté : " + ct + ". Seuls PDF et vidéos sont acceptés.");
        }
    }

    private String detectFileType(String objectKey) {
        String key = objectKey.toLowerCase();
        if (key.endsWith(".pdf"))  return "pdf";
        if (key.endsWith(".mp4"))  return "video/mp4";
        if (key.endsWith(".webm")) return "video/webm";
        if (key.endsWith(".ogg"))  return "video/ogg";
        return "unknown";
    }

    private MediaType resolveMediaType(String objectKey) {
        String key = objectKey.toLowerCase();
        if (key.endsWith(".pdf"))  return MediaType.APPLICATION_PDF;
        if (key.endsWith(".mp4"))  return MediaType.parseMediaType("video/mp4");
        if (key.endsWith(".webm")) return MediaType.parseMediaType("video/webm");
        if (key.endsWith(".ogg"))  return MediaType.parseMediaType("video/ogg");
        return MediaType.APPLICATION_OCTET_STREAM;
    }

    private String extractFileName(String objectKey) {
        int slash = objectKey.lastIndexOf('/');
        return slash >= 0 ? objectKey.substring(slash + 1) : objectKey;
    }
}
