package com.example.microservice_notification.dto;

import lombok.Data;

@Data
public class CourseInteractionEvent {
    private Long courseId;
    private Long teacherId;
    private Long studentId;
    private String type;      // LIKE / COMMENT
    private String message;
}
