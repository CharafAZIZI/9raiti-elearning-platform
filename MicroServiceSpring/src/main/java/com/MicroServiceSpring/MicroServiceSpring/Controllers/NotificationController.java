package com.MicroServiceSpring.MicroServiceSpring.Controllers;

import com.MicroServiceSpring.MicroServiceSpring.DTO.NotificationsDTO.CreateNotificationDTO;
import com.MicroServiceSpring.MicroServiceSpring.DTO.NotificationsDTO.NotificationDTO;
import com.MicroServiceSpring.MicroServiceSpring.Services.Notifications.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public NotificationDTO create(@RequestBody CreateNotificationDTO dto) {
        return notificationService.createNotification(dto);
    }

    @GetMapping("/user/{userId}")
    public List<NotificationDTO> getUserNotifications(@PathVariable Long userId) {
        return notificationService.getUserNotifications(userId);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }
}