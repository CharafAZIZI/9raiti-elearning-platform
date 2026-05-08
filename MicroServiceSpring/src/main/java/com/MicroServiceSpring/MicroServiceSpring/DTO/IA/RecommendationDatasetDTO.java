package com.MicroServiceSpring.MicroServiceSpring.DTO.IA;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationDatasetDTO {

    private Long userId;

    private Long coursId;

    private Double score;
}