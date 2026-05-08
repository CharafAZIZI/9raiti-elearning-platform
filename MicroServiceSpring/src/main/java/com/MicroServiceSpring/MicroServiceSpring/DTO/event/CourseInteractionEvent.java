package com.MicroServiceSpring.MicroServiceSpring.DTO.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseInteractionEvent {
    private Long courseId;
    private Long teacherId;
    private Long studentId;
    private String type; // LIKE / COMMENT
    private String message;
}