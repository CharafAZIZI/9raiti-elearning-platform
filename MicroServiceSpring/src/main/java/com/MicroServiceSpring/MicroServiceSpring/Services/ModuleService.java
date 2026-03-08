package com.MicroServiceSpring.MicroServiceSpring.Services;

import com.MicroServiceSpring.MicroServiceSpring.DTO.ModuleDTO;
import java.util.List;

public interface ModuleService {

    ModuleDTO createModule(ModuleDTO dto);
    ModuleDTO updateModule(Long id, ModuleDTO dto);
    ModuleDTO getModuleById(Long id);
    List<ModuleDTO> getAllModules();
    void deleteModule(Long id);
}