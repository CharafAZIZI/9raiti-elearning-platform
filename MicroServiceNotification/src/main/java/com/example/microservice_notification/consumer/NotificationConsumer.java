package com.example.microservice_notification.consumer;

import com.example.microservice_notification.service.INotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationConsumer {

    private final INotificationService notificationService;

    @KafkaListener(topics = "course-content-added", groupId = "notification-group")
    public void consumeCourseContent(String message) {
        notificationService.handleCourseContent(message);
    }

    @KafkaListener(topics = "admin-broadcast", groupId = "notification-group")
    public void consumeAdminMessage(String message) {
        log.info("[Kafka] admin-broadcast reçu : {}", message);
        notificationService.handleAdminMessage(message);
    }

    @KafkaListener(topics = "course-interaction", groupId = "notification-group")
    public void consumeInteraction(String message) {
        notificationService.handleInteraction(message);
    }
}