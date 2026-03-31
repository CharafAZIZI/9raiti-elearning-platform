package com.MicroServiceSpring.MicroServiceSpring.Controllers;
import com.MicroServiceSpring.MicroServiceSpring.DTO.CoursDTO;
import com.MicroServiceSpring.MicroServiceSpring.Services.CoursService;
import com.MicroServiceSpring.MicroServiceSpring.Services.Minio.MinioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
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
        return ResponseEntity.ok(coursService.createCours(dto));
    }

    @GetMapping
    public ResponseEntity<List<CoursDTO>> getAll() {
        return ResponseEntity.ok(coursService.getAllCours());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CoursDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(coursService.getCoursById(id));
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

    @PostMapping("/{id}/upload")
    public ResponseEntity<String> uploadFile(@PathVariable Long id,
                                             @RequestParam("file") MultipartFile file) throws IOException {
        String fileName = minioService.uploadFile(file);

        CoursDTO cours = coursService.getCoursById(id);
        cours.setFilePath(fileName);
        coursService.updateCours(id, cours);

        return ResponseEntity.ok("Fichier uploadé avec succès : " + fileName);
    }

    // Download PDF pour Postman / Angular
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id,
                                               @RequestParam(defaultValue = "attachment") String mode) throws IOException {
        CoursDTO cours = coursService.getCoursById(id);

        byte[] data = minioService.downloadFile(cours.getFilePath());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, mode + "; filename=\"" + cours.getFilePath() + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }
}