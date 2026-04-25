package com.MicroServiceSpring.MicroServiceSpring.Services.Cours;

import com.MicroServiceSpring.MicroServiceSpring.DTO.CoursDTO;

import java.util.List;

public interface CoursService {
    CoursDTO createCours(CoursDTO dto);
    CoursDTO updateCours(Long id, CoursDTO dto);
    CoursDTO getCoursById(Long id);
    List<CoursDTO> getAllCours();
    List<CoursDTO> getCoursByModuleId(Long moduleId);
    List<CoursDTO> getCoursByEnseignantId(Long enseignantId);
    List<CoursDTO> getCoursPublies();
    void deleteCours(Long id);
    CoursDTO updateFilePath(Long id, String filePath);
}
