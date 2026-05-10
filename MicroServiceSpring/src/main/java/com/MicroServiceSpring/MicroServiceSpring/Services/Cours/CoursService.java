package com.MicroServiceSpring.MicroServiceSpring.Services.Cours;

import com.MicroServiceSpring.MicroServiceSpring.DTO.event.CourseContentAddedEvent;
import com.MicroServiceSpring.MicroServiceSpring.DTO.Cours.CoursDTO;
import com.MicroServiceSpring.MicroServiceSpring.Exceptions.ResourceNotFoundException;
import com.MicroServiceSpring.MicroServiceSpring.Mappers.Cours.CoursMapper;
import com.MicroServiceSpring.MicroServiceSpring.Models.Cours.Cours;
import com.MicroServiceSpring.MicroServiceSpring.Models.Cours.StatutCours;
import com.MicroServiceSpring.MicroServiceSpring.Models.Modules.Module;
import com.MicroServiceSpring.MicroServiceSpring.Repository.Modules.InscriptionRepository;
import com.MicroServiceSpring.MicroServiceSpring.Repository.Cours.CoursRepository;
import com.MicroServiceSpring.MicroServiceSpring.Repository.Modules.ModuleRepository;
import com.MicroServiceSpring.MicroServiceSpring.Security.JwtUtil;
import com.MicroServiceSpring.MicroServiceSpring.kafka.producer.EventProducer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CoursService implements ICoursService {

    private final CoursRepository coursRepository;
    private final ModuleRepository moduleRepository;
    private final CoursMapper coursMapper;
    private final EventProducer notificationProducer;
    private final InscriptionRepository inscriptionRepository;

    @Override
    @Transactional
    public CoursDTO createCours(CoursDTO dto) {

        Long enseignantId = JwtUtil.getCurrentUserId();
        if (enseignantId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur non authentifié.");
        }

        Module module = moduleRepository.findById(dto.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Module introuvable avec l'id : " + dto.getModuleId()));

        Cours cours = coursMapper.toEntity(dto, module);
        cours.setEnseignantId(enseignantId);

        // 🔥 1. SAVE COURS
        Cours saved = coursRepository.save(cours);

        // 🔥 2. Récupérer étudiants du module
        List<Long> studentIds = inscriptionRepository
                .findByModuleId(module.getId())
                .stream()
                .map(ins -> ins.getApprenantId())
                .toList();

        // 🔥 3. SEND EVENT KAFKA
        notificationProducer.sendCourseContent(
                new CourseContentAddedEvent(
                        module.getId(),
                        saved.getIdCours(),
                        enseignantId,
                        saved.getTitre(),
                        "Un nouveau cours a été ajouté au module " + module.getNom(),
                        studentIds // 👈 optionnel si tu enrichis ton event
                )
        );

        return coursMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public CoursDTO updateCours(Long id, CoursDTO dto) {
        Long currentUserId = JwtUtil.getCurrentUserId();
        Cours cours;
        if (JwtUtil.isAdmin()) {
            cours = coursRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable avec l'id : " + id));
        } else {
            cours = coursRepository.findByIdCoursAndEnseignantId(id, currentUserId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.FORBIDDEN, "Vous n'êtes pas autorisé à modifier ce cours."));
        }
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
        return coursRepository.findAll().stream().map(coursMapper::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CoursDTO> getCoursByModuleId(Long moduleId) {
        return coursRepository.findByModuleId(moduleId).stream().map(coursMapper::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CoursDTO> getCoursByEnseignantId(Long enseignantId) {
        return coursRepository.findByEnseignantId(enseignantId).stream().map(coursMapper::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CoursDTO> getCoursPublies() {
        return coursRepository.findByStatut(StatutCours.PUBLIE).stream().map(coursMapper::toDTO).toList();
    }

    @Override
    @Transactional
    public void deleteCours(Long id) {
        Long currentUserId = JwtUtil.getCurrentUserId();
        if (JwtUtil.isAdmin()) {
            if (!coursRepository.existsById(id)) {
                throw new ResourceNotFoundException("Cours introuvable avec l'id : " + id);
            }
        } else {
            coursRepository.findByIdCoursAndEnseignantId(id, currentUserId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.FORBIDDEN, "Vous n'êtes pas autorisé à supprimer ce cours."));
        }
        coursRepository.deleteById(id);
    }

    @Override
    @Transactional
    public CoursDTO updateFilePath(Long id, String filePath) {
        Cours cours = coursRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable avec l'id : " + id));
        cours.setFilePath(filePath);
        return coursMapper.toDTO(coursRepository.save(cours));
    }
}
