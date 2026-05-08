package com.MicroServiceSpring.MicroServiceSpring.DTO.Interaction;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class NoteRequestDTO {
    @Min(1) @Max(5)
    private Integer note;
}
