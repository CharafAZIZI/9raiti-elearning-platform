package com.MicroServiceSpring.MicroServiceSpring.DTO.Interaction;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class NoteResponseDTO {
    private Long coursId;
    private Integer note;
    private Double moyenneNotes;
    private Long totalNotes;
}
