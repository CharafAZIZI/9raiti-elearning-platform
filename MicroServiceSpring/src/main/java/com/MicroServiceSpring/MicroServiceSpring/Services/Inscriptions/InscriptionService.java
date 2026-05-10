package com.MicroServiceSpring.MicroServiceSpring.Services.Inscriptions;

import com.MicroServiceSpring.MicroServiceSpring.DTO.Modules.ApprenantInscritDTO;
import com.MicroServiceSpring.MicroServiceSpring.DTO.Modules.InscriptionDTO;
import com.MicroServiceSpring.MicroServiceSpring.Exceptions.ConflictException;
import com.MicroServiceSpring.MicroServiceSpring.Exceptions.ResourceNotFoundException;
import com.MicroServiceSpring.MicroServiceSpring.Mappers.Modules.InscriptionMapper;
import com.MicroServiceSpring.MicroServiceSpring.Models.Inscriptions.Inscription;
import com.MicroServiceSpring.MicroServiceSpring.Models.Modules.Module;
import com.MicroServiceSpring.MicroServiceSpring.Repository.Modules.InscriptionRepository;
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
public class InscriptionService implements IInscriptionService {

    private final InscriptionRepository inscriptionRepository;
    private final ModuleRepository      moduleRepository;
    private final InscriptionMapper     inscriptionMapper;

    // ── Helper ───────────────────────────────────────────────────────────────

    private Long requireCurrentUserId() {
        Long id = JwtUtil.getCurrentUserId();
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur non authentifié.");
        }
        return id;
    }

    // ── Côté APPRENANT ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public InscriptionDTO inscrire(Long moduleId) {
        Long apprenantId = requireCurrentUserId();

        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Module introuvable avec l'id : " + moduleId));

        if (!module.isActif()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Impossible de s'inscrire à un module inactif.");
        }

        if (inscriptionRepository.existsByApprenantIdAndModuleId(apprenantId, moduleId)) {
            throw new ConflictException("Vous êtes déjà inscrit à ce module.");
        }

        Inscription ins = new Inscription();
        ins.setApprenantId(apprenantId);
        ins.setModule(module);

        return inscriptionMapper.toDTO(inscriptionRepository.save(ins));
    }

    @Override
    @Transactional
    public void desinscrire(Long moduleId) {
        Long apprenantId = requireCurrentUserId();

        Inscription ins = inscriptionRepository
                .findByApprenantIdAndModuleId(apprenantId, moduleId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Vous n'êtes pas inscrit à ce module."));

        inscriptionRepository.delete(ins);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InscriptionDTO> getMesInscriptions() {
        Long apprenantId = requireCurrentUserId();
        return inscriptionRepository.findByApprenantId(apprenantId)
                .stream()
                .map(inscriptionMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean estInscrit(Long moduleId) {
        Long apprenantId = requireCurrentUserId();
        return inscriptionRepository.existsByApprenantIdAndModuleId(apprenantId, moduleId);
    }

    // ── Côté ENSEIGNANT ───────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<ApprenantInscritDTO> getApprenantsDuModule(Long moduleId) {
        Long enseignantId = requireCurrentUserId();

        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Module introuvable avec l'id : " + moduleId));

        // Vérifier que l'enseignant est bien propriétaire du module (ou admin)
        if (!JwtUtil.isAdmin() && !module.getEnseignantId().equals(enseignantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Vous n'êtes pas propriétaire de ce module.");
        }

        return inscriptionRepository.findByModuleId(moduleId)
                .stream()
                .map(ins -> toApprenantDTO(ins, module))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApprenantInscritDTO> getMesApprenants() {
        Long enseignantId = requireCurrentUserId();

        return inscriptionRepository.findByEnseignantId(enseignantId)
                .stream()
                .map(ins -> toApprenantDTO(ins, ins.getModule()))
                .toList();
    }

    // ── Mapper interne ────────────────────────────────────────────────────────

    private ApprenantInscritDTO toApprenantDTO(Inscription ins, Module module) {
        return new ApprenantInscritDTO(
                ins.getId(),
                ins.getApprenantId(),
                module.getId(),
                module.getNom(),
                module.getCode(),
                ins.getDateInscription()
        );
    }
}
