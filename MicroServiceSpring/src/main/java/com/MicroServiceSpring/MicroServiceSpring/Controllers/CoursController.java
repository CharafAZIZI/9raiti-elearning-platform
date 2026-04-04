package com.MicroServiceSpring.MicroServiceSpring.Controllers;

import com.MicroServiceSpring.MicroServiceSpring.DTO.CoursDTO;
import com.MicroServiceSpring.MicroServiceSpring.Services.CoursService;
import com.MicroServiceSpring.MicroServiceSpring.Services.Minio.MinioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/cours")
@RequiredArgsConstructor
public class CoursController {

    private final CoursService coursService;
    private final MinioService minioService;

    @PostMapping
    public ResponseEntity<CoursDTO> create(@Valid @RequestBody CoursDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(coursService.createCours(dto));
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
    public ResponseEntity<CoursDTO> update(@PathVariable Long id,
                                           @Valid @RequestBody CoursDTO dto) {
        return ResponseEntity.ok(coursService.updateCours(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        coursService.deleteCours(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Upload d'un fichier vers MinIO et sauvegarde du filePath dans le cours.
     * CORRECTION : utilise updateFilePath() pour ne pas écraser moduleId et autres champs.
     */
    @PostMapping("/{id}/upload")
    public ResponseEntity<String> uploadFile(@PathVariable Long id,
                                             @RequestParam("file") MultipartFile file) throws IOException {
        String fileName = minioService.uploadFile(file);
        coursService.updateFilePath(id, fileName);
        return ResponseEntity.ok("Fichier uploadé avec succès : " + fileName);
    }

    /**
     * Téléchargement ou prévisualisation d'un fichier depuis MinIO.
     * CORRECTION : content-type déduit du nom de fichier, pas forcément PDF.
     * mode = "attachment" (téléchargement) ou "inline" (prévisualisation)
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable Long id,
            @RequestParam(defaultValue = "attachment") String mode) throws IOException {

        CoursDTO cours = coursService.getCoursById(id);
        String filePath = cours.getFilePath();

        if (filePath == null || filePath.isBlank()) {
            return ResponseEntity.notFound().build();
        }

        byte[] data = minioService.downloadFile(filePath);

        // Déterminer le content-type selon l'extension
        MediaType mediaType = filePath.toLowerCase().endsWith(".pdf")
                ? MediaType.APPLICATION_PDF
                : MediaType.APPLICATION_OCTET_STREAM;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        mode + "; filename=\"" + filePath + "\"")
                .contentType(mediaType)
                .body(data);
    }
}
