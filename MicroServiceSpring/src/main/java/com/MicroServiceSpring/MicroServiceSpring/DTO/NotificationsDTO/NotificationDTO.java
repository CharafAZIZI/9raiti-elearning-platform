package com.MicroServiceSpring.MicroServiceSpring.DTO.NotificationsDTO;

import com.MicroServiceSpring.MicroServiceSpring.Models.Notification.NotificationType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationDTO {

    private Long id;
    private Long recipientId;
    private String title;
    private String message;
    private NotificationType type;
    private Long courseId;
    private Long moduleId;
    private boolean readStatus;
    private LocalDateTime createdAt;
}