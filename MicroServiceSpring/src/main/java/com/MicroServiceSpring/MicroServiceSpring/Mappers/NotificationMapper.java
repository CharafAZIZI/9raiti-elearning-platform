package com.MicroServiceSpring.MicroServiceSpring.Mappers;

import com.MicroServiceSpring.MicroServiceSpring.DTO.NotificationsDTO.CreateNotificationDTO;
import com.MicroServiceSpring.MicroServiceSpring.DTO.NotificationsDTO.NotificationDTO;
import com.MicroServiceSpring.MicroServiceSpring.Models.Notification.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationDTO toDTO(Notification entity) {
        NotificationDTO dto = new NotificationDTO();

        dto.setId(entity.getId());
        dto.setRecipientId(entity.getRecipientId());
        dto.setTitle(entity.getTitle());
        dto.setMessage(entity.getMessage());
        dto.setType(entity.getType());
        dto.setCourseId(entity.getCourseId());
        dto.setModuleId(entity.getModuleId());
        dto.setReadStatus(entity.isReadStatus());
        dto.setCreatedAt(entity.getCreatedAt());

        return dto;
    }

    public Notification toEntity(CreateNotificationDTO dto) {
        Notification n = new Notification();

        n.setRecipientId(dto.getRecipientId());
        n.setTitle(dto.getTitle());
        n.setMessage(dto.getMessage());
        n.setType(dto.getType());
        n.setCourseId(dto.getCourseId());
        n.setModuleId(dto.getModuleId());

        n.setReadStatus(false); // bonne pratique
        return n;
    }
}