package com.MicroServiceSpring.MicroServiceSpring.Controllers;

import com.MicroServiceSpring.MicroServiceSpring.DTO.CoursDTO;
import com.MicroServiceSpring.MicroServiceSpring.Services.Cours.CoursService;
import com.MicroServiceSpring.MicroServiceSpring.Services.Minio.MinioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cours")
@RequiredArgsConstructor
public class CoursController {

    private final CoursService coursService;
    private final MinioService minioService;

    // ── CRUD de base ──────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<CoursDTO> create(@Valid @RequestBody CoursDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(coursService.createCours(dto));
    }

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

    @PutMapping("/{id}")
    public ResponseEntity<CoursDTO> update(@PathVariable Long id, @Valid @RequestBody CoursDTO dto) {
        return ResponseEntity.ok(coursService.updateCours(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        // Supprimer aussi le fichier MinIO si présent
        CoursDTO cours = coursService.getCoursById(id);
        if (cours.getFilePath() != null) {
            minioService.deleteFile(cours.getFilePath());
        }
        coursService.deleteCours(id);
        return ResponseEntity.noContent().build();
    }

    // ── MinIO : Upload ────────────────────────────────────────────────────────

    /**
     * POST /api/cours/{id}/upload
     * Accepte PDF et vidéos (mp4, webm, avi, etc.)
     * Retourne l'objectKey stocké en base.
     */
    @PostMapping("/{id}/upload")
    public ResponseEntity<Map<String, String>> uploadFile(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {

        validateFileType(file);

        // Si un ancien fichier existe, le supprimer de MinIO avant remplacement
        CoursDTO existing = coursService.getCoursById(id);
        if (existing.getFilePath() != null) {
            minioService.deleteFile(existing.getFilePath());
        }

        String objectKey = minioService.uploadFile(file);
        coursService.updateFilePath(id, objectKey);

        return ResponseEntity.ok(Map.of(
            "objectKey", objectKey,
            "message", "Fichier uploadé avec succès"
        ));
    }

    // ── MinIO : URL pré-signée (RECOMMANDÉ pour lecture) ─────────────────────

    /**
     * GET /api/cours/{id}/presigned-url
     * Retourne une URL pré-signée valable 15 min.
     * Angular l'utilise directement dans un <iframe> (PDF) ou <video> (vidéo).
     */
    @GetMapping("/{id}/presigned-url")
    public ResponseEntity<Map<String, String>> getPresignedUrl(@PathVariable Long id) {
        CoursDTO cours = coursService.getCoursById(id);
        String filePath = cours.getFilePath();

        if (filePath == null || filePath.isBlank()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Aucun fichier associé à ce cours."));
        }

        String url = minioService.generatePresignedUrl(filePath);
        String type = detectFileType(filePath);

        return ResponseEntity.ok(Map.of(
            "url", url,
            "type", type,
            "objectKey", filePath
        ));
    }

    // ── MinIO : Proxy download (fallback) ─────────────────────────────────────

    /**
     * GET /api/cours/{id}/download?mode=inline|attachment
     * Proxy le fichier depuis MinIO (moins performant que presigned-url,
     * mais utile si le client ne peut pas accéder directement à MinIO).
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable Long id,
            @RequestParam(defaultValue = "inline") String mode) throws IOException {

        CoursDTO cours = coursService.getCoursById(id);
        String filePath = cours.getFilePath();

        if (filePath == null || filePath.isBlank()) {
            return ResponseEntity.notFound().build();
        }

        byte[] data = minioService.downloadFile(filePath);
        MediaType mediaType = resolveMediaType(filePath);

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, mode + "; filename=\"" + extractFileName(filePath) + "\"")
            .contentType(mediaType)
            .body(data);
    }

    // ── Helpers privés ────────────────────────────────────────────────────────

    private void validateFileType(MultipartFile file) {
        String ct = file.getContentType();
        if (ct == null || (!ct.equals("application/pdf") && !ct.startsWith("video/"))) {
            throw new IllegalArgumentException(
                "Type de fichier non supporté : " + ct + ". Seuls PDF et vidéos sont acceptés."
            );
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
