package com.MicroServiceSpring.MicroServiceSpring.Services.Notifications;


import com.MicroServiceSpring.MicroServiceSpring.DTO.NotificationsDTO.CreateNotificationDTO;
import com.MicroServiceSpring.MicroServiceSpring.DTO.NotificationsDTO.NotificationDTO;

import java.util.List;

public interface INotificationService {

    NotificationDTO createNotification(CreateNotificationDTO dto);

    List<NotificationDTO> getUserNotifications(Long userId);

    void markAsRead(Long notificationId);
}