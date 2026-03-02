package com.MicroServiceSpring.MicroServiceSpring.Controllers;

import com.MicroServiceSpring.MicroServiceSpring.Models.Cours;
import com.MicroServiceSpring.MicroServiceSpring.Services.CoursService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@RestController
@RequestMapping("/api/cours")
@RequiredArgsConstructor
public class CoursController {

    private final CoursService coursService; // Service pour la logique métier

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public Cours create(
            @RequestPart("cours") String coursJson, // Cours en JSON
            @RequestPart(value = "file", required = false) MultipartFile file // Fichier optionnel
    ) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        Cours cours = objectMapper.readValue(coursJson, Cours.class); // Convertir JSON en objet
        return coursService.createCours(cours, file); // Sauvegarder le cours
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Cours> getAll() {
        return coursService.getAllCours(); // Récupérer tous les cours
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Cours getById(@PathVariable Long id) {
        return coursService.getCoursById(id); // Récupérer un cours par ID
    }
}
