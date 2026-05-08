package com.MicroServiceSpring.MicroServiceSpring.DTO.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseContentAddedEvent {

    private Long moduleId;
    private Long courseId;
    private Long teacherId;
    private String title;
    private String message;
    private List<Long> studentIds;
}