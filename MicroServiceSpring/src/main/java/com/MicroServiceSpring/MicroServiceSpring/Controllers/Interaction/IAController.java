package com.MicroServiceSpring.MicroServiceSpring.Controllers.Interaction;

import com.MicroServiceSpring.MicroServiceSpring.DTO.IA.RecommendationDatasetDTO;
import com.MicroServiceSpring.MicroServiceSpring.Services.IA.AIDataSetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class IAController {

    private final AIDataSetService service;

    @GetMapping("/dataset")
    public List<RecommendationDatasetDTO> getDataset() {
        return service.buildDataset();
    }
}