package com.MicroServiceSpring.MicroServiceSpring.Services.Modules;

import com.MicroServiceSpring.MicroServiceSpring.DTO.Modules.ModuleDTO;
import com.MicroServiceSpring.MicroServiceSpring.Exceptions.ConflictException;
import com.MicroServiceSpring.MicroServiceSpring.Exceptions.ResourceNotFoundException;
import com.MicroServiceSpring.MicroServiceSpring.Mappers.Modules.ModuleMapper;
import com.MicroServiceSpring.MicroServiceSpring.Models.Modules.Module;
import com.MicroServiceSpring.MicroServiceSpring.Repository.Modules.ModuleRepository;
import com.MicroServiceSpring.MicroServiceSpring.Security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ModuleServiceImpl implements ModuleService {

    private final ModuleRepository moduleRepository;
    private final ModuleMapper moduleMapper;

    @Override
    @Transactional
    public ModuleDTO createModule(ModuleDTO dto) {
        if (moduleRepository.existsByCode(dto.getCode())) {
            throw new ConflictException("Un module avec le code '" + dto.getCode() + "' existe déjà.");
        }
        Long enseignantId = JwtUtil.getCurrentUserId();
        if (enseignantId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur non authentifié.");
        }
        Module module = moduleMapper.toEntity(dto);
        module.setEnseignantId(enseignantId); // ← injection automatique
        return moduleMapper.toDTO(moduleRepository.save(module));
    }

    @Override
    @Transactional(readOnly = true)
    public ModuleDTO getModuleById(Long id) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module introuvable avec l'id : " + id));
        return moduleMapper.toDTO(module);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModuleDTO> getAllModules() {
        // Lecture publique — tous les modules avec leur enseignantId
        return moduleRepository.findAll().stream().map(moduleMapper::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModuleDTO> getModulesByCategorieId(Long categorieId) {
        // Lecture publique — tous les modules d'une catégorie
        return moduleRepository.findByCategorie_Id(categorieId).stream().map(moduleMapper::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModuleDTO> getModulesByEnseignantId(Long enseignantId) {
        return moduleRepository.findByEnseignantId(enseignantId).stream().map(moduleMapper::toDTO).toList();
    }

    @Override
    @Transactional
    public ModuleDTO updateModule(Long id, ModuleDTO dto) {
        Long currentUserId = JwtUtil.getCurrentUserId();
        Module module;
        if (JwtUtil.isAdmin()) {
            // L'admin peut modifier n'importe quel module
            module = moduleRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Module introuvable avec l'id : " + id));
        } else {
            // L'enseignant ne peut modifier que ses propres modules
            module = moduleRepository.findByIdAndEnseignantId(id, currentUserId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.FORBIDDEN, "Vous n'êtes pas autorisé à modifier ce module."));
        }
        moduleMapper.updateEntityFromDTO(dto, module);
        return moduleMapper.toDTO(moduleRepository.save(module));
    }

    @Override
    @Transactional
    public void deleteModule(Long id) {
        Long currentUserId = JwtUtil.getCurrentUserId();
        if (JwtUtil.isAdmin()) {
            if (!moduleRepository.existsById(id)) {
                throw new ResourceNotFoundException("Module introuvable avec l'id : " + id);
            }
        } else {
            moduleRepository.findByIdAndEnseignantId(id, currentUserId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.FORBIDDEN, "Vous n'êtes pas autorisé à supprimer ce module."));
        }
        moduleRepository.deleteById(id);
    }
}
