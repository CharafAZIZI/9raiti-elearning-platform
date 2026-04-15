package com.MicroServiceSpring.MicroServiceSpring.Services;
import com.MicroServiceSpring.MicroServiceSpring.DTO.CoursDTO;
import java.util.List;

public interface CoursService {

    CoursDTO createCours(CoursDTO dto);
    CoursDTO updateCours(Long id, CoursDTO dto);
    CoursDTO getCoursById(Long id);
    List<CoursDTO> getAllCours();
    void deleteCours(Long id);
}
