package com.MicroServiceSpring.MicroServiceSpring.DTO.Interaction;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LikeResponseDTO {
    private Long coursId;
    private boolean liked;
    private long totalLikes;
}
