package com.MicroServiceSpring.MicroServiceSpring.Services.Notifications;

import com.MicroServiceSpring.MicroServiceSpring.DTO.NotificationsDTO.CreateNotificationDTO;
import com.MicroServiceSpring.MicroServiceSpring.DTO.NotificationsDTO.NotificationDTO;
import com.MicroServiceSpring.MicroServiceSpring.Mappers.NotificationMapper;
import com.MicroServiceSpring.MicroServiceSpring.Models.Notification.Notification;
import com.MicroServiceSpring.MicroServiceSpring.Repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    @Override
    public NotificationDTO createNotification(CreateNotificationDTO dto) {

        Notification notification = notificationMapper.toEntity(dto);

        Notification saved = notificationRepository.save(notification);

        return notificationMapper.toDTO(saved);
    }

    @Override
    public List<NotificationDTO> getUserNotifications(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(notificationMapper::toDTO)
                .toList();
    }

    @Override
    public void markAsRead(Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        n.setReadStatus(true);
        notificationRepository.save(n);
    }
}