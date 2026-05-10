package com.example.microservice_notification.DTO;

import lombok.Data;

import java.util.List;

@Data
public class CourseContentEvent {
    private Long courseId;
    private Long moduleId;
    private Long teacherId;
    private String title;
    private String message;
    private List<Long> studentIds;
}
