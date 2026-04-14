package com.MicroServiceSpring.MicroServiceSpring.Services;

import com.MicroServiceSpring.MicroServiceSpring.DTO.CoursDTO;

import java.util.List;

public interface CoursService {

    CoursDTO createCours(CoursDTO dto);
    CoursDTO updateCours(Long id, CoursDTO dto);
    CoursDTO getCoursById(Long id);
    List<CoursDTO> getAllCours();
    void deleteCours(Long id);

    List<CoursDTO> getCoursByModuleId(Long moduleId);
    List<CoursDTO> getCoursPublies();

    // Mise à jour du filePath uniquement (pour l'upload)
    CoursDTO updateFilePath(Long id, String filePath);
}
