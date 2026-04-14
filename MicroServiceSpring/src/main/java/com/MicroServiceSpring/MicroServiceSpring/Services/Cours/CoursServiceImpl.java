package com.MicroServiceSpring.MicroServiceSpring.Services.Cours;

import com.MicroServiceSpring.MicroServiceSpring.DTO.CoursDTO;
import com.MicroServiceSpring.MicroServiceSpring.Exceptions.ResourceNotFoundException;
import com.MicroServiceSpring.MicroServiceSpring.Mappers.CoursMapper;
import com.MicroServiceSpring.MicroServiceSpring.Models.Cours.Cours;
import com.MicroServiceSpring.MicroServiceSpring.Models.Modules.Module;
import com.MicroServiceSpring.MicroServiceSpring.Models.Cours.StatutCours;
import com.MicroServiceSpring.MicroServiceSpring.Repository.CoursRepository;
import com.MicroServiceSpring.MicroServiceSpring.Repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CoursServiceImpl implements CoursService {

    private final CoursRepository coursRepository;
    private final ModuleRepository moduleRepository;
    private final CoursMapper coursMapper;

    @Override
    @Transactional
    public CoursDTO createCours(CoursDTO dto) {
        Module module = moduleRepository.findById(dto.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Module introuvable avec l'id : " + dto.getModuleId()));
        Cours cours = coursMapper.toEntity(dto, module);
        return coursMapper.toDTO(coursRepository.save(cours));
    }

    @Override
    @Transactional
    public CoursDTO updateCours(Long id, CoursDTO dto) {
        Cours cours = coursRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable avec l'id : " + id));
        Module module = moduleRepository.findById(dto.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Module introuvable avec l'id : " + dto.getModuleId()));
        coursMapper.updateEntityFromDTO(dto, cours, module);
        return coursMapper.toDTO(coursRepository.save(cours));
    }

    @Override
    @Transactional(readOnly = true)
    public CoursDTO getCoursById(Long id) {
        return coursRepository.findById(id)
                .map(coursMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable avec l'id : " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CoursDTO> getAllCours() {
        return coursRepository.findAll()
                .stream()
                .map(coursMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional
    public void deleteCours(Long id) {
        if (!coursRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cours introuvable avec l'id : " + id);
        }
        coursRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CoursDTO> getCoursByModuleId(Long moduleId) {
        return coursRepository.findByModuleId(moduleId)
                .stream()
                .map(coursMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CoursDTO> getCoursPublies() {
        // CORRECTION : passer l'enum, pas un String
        return coursRepository.findByStatut(StatutCours.PUBLIE)
                .stream()
                .map(coursMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional
    public CoursDTO updateFilePath(Long id, String filePath) {
        // CORRECTION : mise à jour isolée du filePath sans écraser les autres champs
        Cours cours = coursRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable avec l'id : " + id));
        cours.setFilePath(filePath);
        return coursMapper.toDTO(coursRepository.save(cours));
    }
}
