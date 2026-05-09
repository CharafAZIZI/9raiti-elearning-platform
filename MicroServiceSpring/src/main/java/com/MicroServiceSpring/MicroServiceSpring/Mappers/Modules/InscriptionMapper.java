package com.MicroServiceSpring.MicroServiceSpring.Mappers.Modules;

import com.MicroServiceSpring.MicroServiceSpring.DTO.Modules.InscriptionDTO;
import com.MicroServiceSpring.MicroServiceSpring.DTO.Modules.ModuleDTO;
import com.MicroServiceSpring.MicroServiceSpring.Models.Inscriptions.Inscription;
import com.MicroServiceSpring.MicroServiceSpring.Models.Modules.Module;
import org.springframework.stereotype.Component;

@Component
public class InscriptionMapper {

    public InscriptionDTO toDTO(Inscription ins) {
        InscriptionDTO dto = new InscriptionDTO();
        dto.setId(ins.getId());
        dto.setApprenantId(ins.getApprenantId());
        dto.setDateInscription(ins.getDateInscription());
        dto.setModule(moduleToDTO(ins.getModule()));
        return dto;
    }

    private ModuleDTO moduleToDTO(Module m) {
        ModuleDTO mDto = new ModuleDTO();
        mDto.setId(m.getId());
        mDto.setNom(m.getNom());
        mDto.setDescription(m.getDescription());
        mDto.setCode(m.getCode());
        mDto.setActif(m.isActif());
        mDto.setEnseignantId(m.getEnseignantId());
        if (m.getCategorie() != null) {
            mDto.setCategorieId(m.getCategorie().getId());
        }
        return mDto;
    }
}