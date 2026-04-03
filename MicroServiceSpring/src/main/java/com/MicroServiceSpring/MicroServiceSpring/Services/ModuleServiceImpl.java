package com.MicroServiceSpring.MicroServiceSpring.Services;

import com.MicroServiceSpring.MicroServiceSpring.DTO.ModuleDTO;
import com.MicroServiceSpring.MicroServiceSpring.Mappers.ModuleMapper;
import com.MicroServiceSpring.MicroServiceSpring.Models.Module;
import com.MicroServiceSpring.MicroServiceSpring.Repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ModuleServiceImpl implements ModuleService {

    private final ModuleRepository moduleRepository;
    private final ModuleMapper moduleMapper;

    @Override
    public ModuleDTO createModule(ModuleDTO dto) {
        if (moduleRepository.existsByCode(dto.getCode())) {
            throw new RuntimeException("Code module déjà utilisé");
        }
        Module module = moduleMapper.toEntity(dto);
        return moduleMapper.toDTO(moduleRepository.save(module));
    }

    @Override
    public ModuleDTO getModuleById(Long id) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Module introuvable"));
        return moduleMapper.toDTO(module);
    }

    @Override
    public List<ModuleDTO> getAllModules() {
        return moduleRepository.findAll()
                .stream()
                .map(moduleMapper::toDTO)
                .toList();
    }

    @Override
    public ModuleDTO updateModule(Long id, ModuleDTO dto) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Module introuvable"));
        moduleMapper.updateEntityFromDTO(dto, module);
        return moduleMapper.toDTO(moduleRepository.save(module));
    }

    @Override
    public void deleteModule(Long id) {
        if (!moduleRepository.existsById(id)) {
            throw new RuntimeException("Module introuvable");
        }
        moduleRepository.deleteById(id);
    }

    // ✅ CORRIGÉ : utilise findByCategorie_Id (underscore) car categorie est @ManyToOne
    @Override
    public List<ModuleDTO> getModulesByCategorieId(Long categorieId) {
        return moduleRepository.findByCategorie_Id(categorieId)
                .stream()
                .map(moduleMapper::toDTO)
                .toList();
    }
}
