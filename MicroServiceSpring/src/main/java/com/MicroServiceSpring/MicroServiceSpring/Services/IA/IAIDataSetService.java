package com.MicroServiceSpring.MicroServiceSpring.Services.IA;

import com.MicroServiceSpring.MicroServiceSpring.DTO.IA.RecommendationDatasetDTO;
import java.util.List;

public interface IAIDataSetService {

    List<RecommendationDatasetDTO> buildDataset();

}