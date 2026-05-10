package com.MicroServiceSpring.MicroServiceSpring.Services.Modules;

import com.MicroServiceSpring.MicroServiceSpring.DTO.Modules.ModuleDTO;

import java.util.List;

public interface IModuleService {
    ModuleDTO createModule(ModuleDTO dto);
    ModuleDTO getModuleById(Long id);
    List<ModuleDTO> getAllModules();
    List<ModuleDTO> getModulesByCategorieId(Long categorieId);
    List<ModuleDTO> getModulesByEnseignantId(Long enseignantId);
    ModuleDTO updateModule(Long id, ModuleDTO dto);
    void deleteModule(Long id);
}
