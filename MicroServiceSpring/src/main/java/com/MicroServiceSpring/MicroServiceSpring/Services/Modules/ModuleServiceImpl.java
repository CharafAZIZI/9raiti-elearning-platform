package com.MicroServiceSpring.MicroServiceSpring.Services.Modules;

import com.MicroServiceSpring.MicroServiceSpring.DTO.ModuleDTO;
import com.MicroServiceSpring.MicroServiceSpring.Exceptions.ConflictException;
import com.MicroServiceSpring.MicroServiceSpring.Exceptions.ResourceNotFoundException;
import com.MicroServiceSpring.MicroServiceSpring.Mappers.ModuleMapper;
import com.MicroServiceSpring.MicroServiceSpring.Models.Modules.Module;
import com.MicroServiceSpring.MicroServiceSpring.Repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        Module module = moduleMapper.toEntity(dto);
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
        return moduleRepository.findAll()
                .stream()
                .map(moduleMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional
    public ModuleDTO updateModule(Long id, ModuleDTO dto) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module introuvable avec l'id : " + id));
        moduleMapper.updateEntityFromDTO(dto, module);
        return moduleMapper.toDTO(moduleRepository.save(module));
    }

    @Override
    @Transactional
    public void deleteModule(Long id) {
        if (!moduleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Module introuvable avec l'id : " + id);
        }
        moduleRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModuleDTO> getModulesByCategorieId(Long categorieId) {
        return moduleRepository.findByCategorie_Id(categorieId)
                .stream()
                .map(moduleMapper::toDTO)
                .toList();
    }
}
