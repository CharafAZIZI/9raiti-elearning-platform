package com.MicroServiceSpring.MicroServiceSpring.Controllers;
import com.MicroServiceSpring.MicroServiceSpring.DTO.CoursDTO;
import com.MicroServiceSpring.MicroServiceSpring.Services.CoursService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cours")
@RequiredArgsConstructor
public class CoursController {

    private final CoursService coursService;

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
}