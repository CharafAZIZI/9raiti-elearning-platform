package com.MicroServiceSpring.MicroServiceSpring.DTO.NotificationsDTO;

import com.MicroServiceSpring.MicroServiceSpring.Models.Notification.NotificationType;
import lombok.Data;

@Data
public class CreateNotificationDTO {

    private Long recipientId;
    private String title;
    private String message;
    private NotificationType type;
    private Long courseId;
    private Long moduleId;
}
