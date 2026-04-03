package com.MicroServiceSpring.MicroServiceSpring.Services;

import com.MicroServiceSpring.MicroServiceSpring.DTO.CoursDTO;
import com.MicroServiceSpring.MicroServiceSpring.Mappers.CoursMapper;
import com.MicroServiceSpring.MicroServiceSpring.Models.Cours;
import com.MicroServiceSpring.MicroServiceSpring.Models.Module;
import com.MicroServiceSpring.MicroServiceSpring.Repository.CoursRepository;
import com.MicroServiceSpring.MicroServiceSpring.Repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CoursServiceImpl implements CoursService {

    private final CoursRepository coursRepository;
    private final ModuleRepository moduleRepository;
    private final CoursMapper coursMapper;

    @Override
    public CoursDTO createCours(CoursDTO dto) {
        Module module = moduleRepository.findById(dto.getModuleId())
                .orElseThrow(() -> new RuntimeException("Module introuvable"));
        Cours cours = coursMapper.toEntity(dto, module);
        return coursMapper.toDTO(coursRepository.save(cours));
    }

    @Override
    public CoursDTO updateCours(Long id, CoursDTO dto) {
        Cours cours = coursRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours introuvable"));
        Module module = moduleRepository.findById(dto.getModuleId())
                .orElseThrow(() -> new RuntimeException("Module introuvable"));
        coursMapper.updateEntityFromDTO(dto, cours, module);
        return coursMapper.toDTO(coursRepository.save(cours));
    }

    @Override
    public CoursDTO getCoursById(Long id) {
        return coursRepository.findById(id)
                .map(coursMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Cours introuvable"));
    }

    @Override
    public List<CoursDTO> getAllCours() {
        return coursRepository.findAll()
                .stream()
                .map(coursMapper::toDTO)
                .toList();
    }

    @Override
    public void deleteCours(Long id) {
        if (!coursRepository.existsById(id)) {
            throw new RuntimeException("Cours introuvable");
        }
        coursRepository.deleteById(id);
    }

    // cours filtrés par module
    @Override
    public List<CoursDTO> getCoursByModuleId(Long moduleId) {
        return coursRepository.findByModuleId(moduleId)
                .stream()
                .map(coursMapper::toDTO)
                .toList();
    }

    // uniquement les cours publiés
    @Override
    public List<CoursDTO> getCoursPublies() {
        return coursRepository.findByStatut("PUBLIE")
                .stream()
                .map(coursMapper::toDTO)
                .toList();
    }
}
